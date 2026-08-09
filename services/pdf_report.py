try:
    from pdf_report import generate_pdf_report
except ImportError:
    import os
    import io
    from typing import Dict, Any

    try:
        os.getcwd()
    except Exception:
        os.getcwd = lambda: "/tmp"

    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import (
        SimpleDocTemplate,
        Paragraph,
        Spacer,
        Table,
        TableStyle,
        HRFlowable,
    )
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors

    def generate_pdf_report(evaluation_data: Dict[str, Any]) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        styles = getSampleStyleSheet()
        PRIMARY = colors.HexColor("#0F172A")
        ACCENT = colors.HexColor("#2563EB")
        TEXT_MUTED = colors.HexColor("#64748B")
        BG_LIGHT = colors.HexColor("#F8FAFC")
        BORDER_COLOR = colors.HexColor("#E2E8F0")

        title_style = ParagraphStyle("DocTitle", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=PRIMARY, spaceAfter=4)
        subtitle_style = ParagraphStyle("DocSubtitle", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=14, textColor=TEXT_MUTED, spaceAfter=12)
        section_heading = ParagraphStyle("SectionHeading", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=ACCENT, spaceBefore=12, spaceAfter=6)
        body_style = ParagraphStyle("BodyTextCustom", parent=styles["Normal"], fontName="Helvetica", fontSize=9.5, leading=13, textColor=PRIMARY)
        bullet_style = ParagraphStyle("BulletText", parent=body_style, leftIndent=12, firstLineIndent=-12, spaceAfter=3)
        evidence_style = ParagraphStyle("EvidenceText", parent=body_style, fontSize=8.5, leading=11, textColor=colors.HexColor("#334155"))
        score_header_style = ParagraphStyle("ScoreHeader", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=28, leading=32, textColor=ACCENT, alignment=1)
        score_label_style = ParagraphStyle("ScoreLabel", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=10, leading=12, textColor=TEXT_MUTED, alignment=1)

        story = []
        candidate_name = evaluation_data.get("candidate_name") or evaluation_data.get("filename") or "Candidate"
        target_role = evaluation_data.get("target_role") or evaluation_data.get("role") or "Target Position"
        overall_score = evaluation_data.get("overall_score", 0.0)
        max_score = evaluation_data.get("max_score", 100)

        story.append(Paragraph("ATSlens Evaluation Report", title_style))
        story.append(Paragraph(f"Role: <b>{target_role}</b> | Subject: <b>{candidate_name}</b>", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=ACCENT, spaceBefore=0, spaceAfter=12))

        score_box_data = [[Paragraph("OVERALL ATS SCORE", score_label_style)], [Paragraph(f"{overall_score:.1f} <font size=16 color='#64748B'>/ {max_score}</font>", score_header_style)]]
        score_box_table = Table(score_box_data, colWidths=[540])
        score_box_table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), BG_LIGHT), ("BOX", (0, 0), (-1, -1), 1, BORDER_COLOR), ("ALIGN", (0, 0), (-1, -1), "CENTER"), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8)]))
        story.append(score_box_table)
        story.append(Spacer(1, 10))

        sub_scores = evaluation_data.get("sub_scores") or {}
        if isinstance(sub_scores, dict):
            work_exp = sub_scores.get("work_experience", 0.0)
            tech_skills = sub_scores.get("technical_skills", 0.0)
            edu = sub_scores.get("education", 0.0)
            proj_impact = sub_scores.get("project_impact", 0.0)
            story.append(Paragraph("Sub-Scores Breakdown", section_heading))
            sub_table_data = [[Paragraph("<b>Work Experience</b>", body_style), Paragraph(f"<b>{work_exp:.1f}</b>", body_style), Paragraph("<b>Technical Skills</b>", body_style), Paragraph(f"<b>{tech_skills:.1f}</b>", body_style)], [Paragraph("<b>Education</b>", body_style), Paragraph(f"<b>{edu:.1f}</b>", body_style), Paragraph("<b>Project Impact</b>", body_style), Paragraph(f"<b>{proj_impact:.1f}</b>", body_style)]]
            sub_table = Table(sub_table_data, colWidths=[140, 130, 140, 130])
            sub_table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), BG_LIGHT), ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR), ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR), ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6), ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8)]))
            story.append(sub_table)
            story.append(Spacer(1, 10))

        doc.build(story)
        return buffer.getvalue()
