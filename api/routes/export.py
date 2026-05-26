from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
import io
from datetime import datetime
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from api.core.database import get_db

router = APIRouter()


def _fix_id(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


async def _get_filtered_publications(filters: dict) -> list:
    """Fetch all filtered publications (no pagination)"""
    db = get_db()
    query = {}

    if filters.get("year"):
        query["year"] = filters["year"]
    elif filters.get("year_from") or filters.get("year_to"):
        year_filter = {}
        if filters.get("year_from"):
            year_filter["$gte"] = filters["year_from"]
        if filters.get("year_to"):
            year_filter["$lte"] = filters["year_to"]
        query["year"] = year_filter

    if filters.get("pub_type"):
        query["pub_type"] = filters["pub_type"]
    else:
        # Exclude 'unknown' pub_type to match frontend behavior
        query["pub_type"] = {"$in": ["journal", "conference", "book"]}

    if filters.get("author_id"):
        query["author_id"] = filters["author_id"]
    elif filters.get("author_name"):
        query["author_name"] = {"$regex": filters["author_name"], "$options": "i"}

    if filters.get("min_citations") is not None or filters.get("max_citations") is not None:
        cit_filter = {}
        if filters.get("min_citations") is not None:
            cit_filter["$gte"] = filters["min_citations"]
        if filters.get("max_citations") is not None:
            cit_filter["$lte"] = filters["max_citations"]
        query["cited_by"] = cit_filter

    allowed_sorts = {"cited_by", "year", "title", "author_name"}
    sort_by = filters.get("sort_by", "cited_by")
    if sort_by not in allowed_sorts:
        sort_by = "cited_by"
    sort_dir = -1 if filters.get("order", "desc") == "desc" else 1

    pubs = (
        await db.publications.find(query)
        .sort(sort_by, sort_dir)
        .to_list(None)  # Fetch all results
    )

    return [_fix_id(p) for p in pubs]


@router.get("/excel")
async def export_to_excel(
    author_id: Optional[str] = Query(None),
    author_name: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    pub_type: Optional[str] = Query(None),
    min_citations: Optional[int] = Query(None),
    max_citations: Optional[int] = Query(None),
    year_from: Optional[int] = Query(None),
    year_to: Optional[int] = Query(None),
    sort_by: str = Query("cited_by"),
    order: str = Query("desc"),
):
    """
    Export filtered publications to Excel
    """
    try:
        filters = {
            "author_id": author_id,
            "author_name": author_name,
            "year": year,
            "pub_type": pub_type,
            "min_citations": min_citations,
            "max_citations": max_citations,
            "year_from": year_from,
            "year_to": year_to,
            "sort_by": sort_by,
            "order": order,
        }
        
        publications = await _get_filtered_publications(filters)
        
        if not publications:
            raise HTTPException(status_code=404, detail="No publications found matching the filters")
        
        # Create Excel workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Publications"
        
        # Define styles
        header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
        header_font = Font(bold=True, color="FFFFFF", size=11)
        header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        
        # Add headers
        headers = ["Author", "Title", "Year", "Type", "Citations", "Link"]
        for col_num, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col_num)
            cell.value = header
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = header_alignment
        
        # Set column widths
        ws.column_dimensions['A'].width = 25
        ws.column_dimensions['B'].width = 40
        ws.column_dimensions['C'].width = 10
        ws.column_dimensions['D'].width = 15
        ws.column_dimensions['E'].width = 12
        ws.column_dimensions['F'].width = 30
        
        # Add data
        for row_num, pub in enumerate(publications, 2):
            ws.cell(row=row_num, column=1).value = pub.get("author_name", "")
            ws.cell(row=row_num, column=2).value = pub.get("title", "")
            ws.cell(row=row_num, column=3).value = pub.get("year", "")
            ws.cell(row=row_num, column=4).value = pub.get("pub_type", "")
            ws.cell(row=row_num, column=5).value = pub.get("cited_by", 0)
            ws.cell(row=row_num, column=6).value = pub.get("link", "")
            
            # Wrap text for title
            ws.cell(row=row_num, column=2).alignment = Alignment(wrap_text=True, vertical="top")
        
        # Save to bytes
        excel_buffer = io.BytesIO()
        wb.save(excel_buffer)
        excel_buffer.seek(0)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"publications_export_{timestamp}.xlsx"
        
        return StreamingResponse(
            iter([excel_buffer.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating Excel file: {str(e)}")


@router.get("/pdf")
async def export_to_pdf(
    author_id: Optional[str] = Query(None),
    author_name: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    pub_type: Optional[str] = Query(None),
    min_citations: Optional[int] = Query(None),
    max_citations: Optional[int] = Query(None),
    year_from: Optional[int] = Query(None),
    year_to: Optional[int] = Query(None),
    sort_by: str = Query("cited_by"),
    order: str = Query("desc"),
):
    """
    Export filtered publications to PDF
    """
    try:
        filters = {
            "author_id": author_id,
            "author_name": author_name,
            "year": year,
            "pub_type": pub_type,
            "min_citations": min_citations,
            "max_citations": max_citations,
            "year_from": year_from,
            "year_to": year_to,
            "sort_by": sort_by,
            "order": order,
        }
        
        publications = await _get_filtered_publications(filters)
        
        if not publications:
            raise HTTPException(status_code=404, detail="No publications found matching the filters")
        
        # Create PDF
        pdf_buffer = io.BytesIO()
        doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
        story = []
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#4472C4'),
            spaceAfter=12,
            alignment=1  # Center
        )
        
        # Title
        story.append(Paragraph("DCSE Faculty Publications Export", title_style))
        story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Styles for table cells
        cell_style = ParagraphStyle(
            'CellStyle',
            parent=styles['Normal'],
            fontSize=8,
            leading=10,
            alignment=0  # Left align
        )
        
        # Create table data with Paragraph objects for proper text wrapping
        header_style = ParagraphStyle(
            'HeaderStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.whitesmoke,
            fontName='Helvetica-Bold',
            alignment=0
        )
        
        table_data = [
            [
                Paragraph("Author", header_style),
                Paragraph("Title", header_style),
                Paragraph("Year", header_style),
                Paragraph("Type", header_style),
                Paragraph("Citations", header_style)
            ]
        ]
        
        for pub in publications:
            author_name = pub.get("author_name", "")
            title = pub.get("title", "")
            year = str(pub.get("year", ""))
            pub_type = pub.get("pub_type", "")
            citations = str(pub.get("cited_by", 0))
            
            table_data.append([
                Paragraph(author_name, cell_style),
                Paragraph(title, cell_style),
                Paragraph(year, cell_style),
                Paragraph(pub_type, cell_style),
                Paragraph(citations, cell_style)
            ])
        
        # Create table with proper column widths
        table = Table(table_data, colWidths=[1.2*inch, 2.8*inch, 0.6*inch, 0.9*inch, 0.7*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4472C4')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F0F0F0')]),
        ]))
        
        story.append(table)
        story.append(Spacer(1, 12))
        story.append(Paragraph(f"<b>Total Publications: {len(publications)}</b>", styles['Normal']))
        
        # Build PDF
        doc.build(story)
        pdf_buffer.seek(0)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"publications_export_{timestamp}.pdf"
        
        return StreamingResponse(
            iter([pdf_buffer.getvalue()]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating PDF file: {str(e)}")
