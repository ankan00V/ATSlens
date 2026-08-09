import os
import io
from typing import Dict, Any

# Safe workaround for os.getcwd permission error in restricted/sandboxed environments
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
    """Generate a styled PDF evaluation summary report from evaluation result data.

    Args:
        evaluation_data: Dict containing overall_score, max_score, category_scores/scores,
                         sub_scores, keyword_gap_analysis, missing_tech_stack,
                         skill_recommendations, key_strengths, areas_for_improvement,
                         bonus_points, deductions, and optional candidate/role metadata.

    Returns:
        bytes: Output PDF file byte buffer.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#0F172A")      # Dark slate
    ACCENT = colors.HexColor("#2563EB")       # Blue accent
    TEXT_MUTED = colors.HexColor("#64748B")   # Muted gray
    BG_LIGHT = colors.HexColor("#F8FAFC")     # Light card background
    BORDER_COLOR = colors.HexColor("#E2E8F0")

    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=PRIMARY,
        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=TEXT_MUTED,
        spaceAfter=12,
    )

    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=ACCENT,
        spaceBefore=12,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13,
        textColor=PRIMARY,
    )

    bullet_style = ParagraphStyle(
        "BulletText",
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-12,
        spaceAfter=3,
    )

    evidence_style = ParagraphStyle(
        "EvidenceText",
        parent=body_style,
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#334155"),
    )

    score_header_style = ParagraphStyle(
        "ScoreHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=28,
        leading=32,
        textColor=ACCENT,
        alignment=1,  # Centered
    )

    score_label_style = ParagraphStyle(
        "ScoreLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=12,
        textColor=TEXT_MUTED,
        alignment=1,
    )

    story = []

    # Extract Metadata
    candidate_name = evaluation_data.get("candidate_name") or evaluation_data.get("filename") or "Candidate"
    target_role = evaluation_data.get("target_role") or evaluation_data.get("role") or "Target Position"
    overall_score = evaluation_data.get("overall_score", 0.0)
    max_score = evaluation_data.get("max_score", 100)

    # Header Section
    story.append(Paragraph("ATSlens Evaluation Report", title_style))
    story.append(Paragraph(f"Role: <b>{target_role}</b> | Subject: <b>{candidate_name}</b>", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=ACCENT, spaceBefore=0, spaceAfter=12))

    # Score Overview Box
    score_box_data = [
        [
            Paragraph("OVERALL ATS SCORE", score_label_style),
        ],
        [
            Paragraph(f"{overall_score:.1f} <font size=16 color='#64748B'>/ {max_score}</font>", score_header_style),
        ]
    ]
    score_box_table = Table(score_box_data, colWidths=[540])
    score_box_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), BG_LIGHT),
            ("BOX", (0, 0), (-1, -1), 1, BORDER_COLOR),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ])
    )
    story.append(score_box_table)
    story.append(Spacer(1, 10))

    # Sub-scores Section
    sub_scores = evaluation_data.get("sub_scores") or {}
    if isinstance(sub_scores, dict):
        def _get_val(v):
            if isinstance(v, dict):
                return float(v.get("score", 0.0))
            try:
                return float(v)
            except (TypeError, ValueError):
                return 0.0

        work_exp = _get_val(sub_scores.get("work_experience") or sub_scores.get("experience"))
        tech_skills = _get_val(sub_scores.get("technical_skills") or sub_scores.get("skills"))
        edu = _get_val(sub_scores.get("education"))
        proj_impact = _get_val(sub_scores.get("project_impact") or sub_scores.get("impact"))

        story.append(Paragraph("Sub-Scores Breakdown", section_heading))
        sub_table_data = [
            [
                Paragraph("<b>Work Experience</b>", body_style),
                Paragraph(f"<b>{work_exp:.1f}</b>", body_style),
                Paragraph("<b>Technical Skills</b>", body_style),
                Paragraph(f"<b>{tech_skills:.1f}</b>", body_style),
            ],
            [
                Paragraph("<b>Education</b>", body_style),
                Paragraph(f"<b>{edu:.1f}</b>", body_style),
                Paragraph("<b>Project Impact</b>", body_style),
                Paragraph(f"<b>{proj_impact:.1f}</b>", body_style),
            ]
        ]
        sub_table = Table(sub_table_data, colWidths=[140, 130, 140, 130])
        sub_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), BG_LIGHT),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ])
        )
        story.append(sub_table)
        story.append(Spacer(1, 10))

    # Category Scores Table
    category_scores = evaluation_data.get("category_scores") or evaluation_data.get("scores") or {}
    if isinstance(category_scores, dict) and category_scores:
        story.append(Paragraph("Category Breakdown & Evidence", section_heading))
        cat_table_rows = [
            [
                Paragraph("<b>Category</b>", body_style),
                Paragraph("<b>Score</b>", body_style),
                Paragraph("<b>Evidence & Feedback</b>", body_style),
            ]
        ]
        for cat_key, cat_val in category_scores.items():
            if isinstance(cat_val, dict):
                score_num = cat_val.get("score", 0)
                max_num = cat_val.get("max", 0)
                evidence = cat_val.get("evidence", "N/A")
                label = cat_key.replace("_", " ").title()
                cat_table_rows.append([
                    Paragraph(f"<b>{label}</b>", body_style),
                    Paragraph(f"{score_num:.1f} / {max_num}", body_style),
                    Paragraph(evidence, evidence_style),
                ])

        cat_table = Table(cat_table_rows, colWidths=[130, 70, 340])
        cat_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
                ("GRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ])
        )
        story.append(cat_table)
        story.append(Spacer(1, 10))

    # Keyword Gap Analysis
    kg = evaluation_data.get("keyword_gap_analysis") or {}
    matched_kw = kg.get("matched_keywords", []) if isinstance(kg, dict) else []
    missing_kw = kg.get("missing_keywords", []) if isinstance(kg, dict) else []
    missing_ts = evaluation_data.get("missing_tech_stack") or []

    if matched_kw or missing_kw or missing_ts:
        story.append(Paragraph("Keyword & Tech Stack Gap Analysis", section_heading))
        kg_items = []
        if matched_kw:
            matched_str = ", ".join(matched_kw)
            kg_items.append(Paragraph(f"<b>Matched Keywords:</b> <font color='#059669'>{matched_str}</font>", body_style))
        if missing_kw:
            missing_str = ", ".join(missing_kw)
            kg_items.append(Paragraph(f"<b>Missing Keywords:</b> <font color='#DC2626'>{missing_str}</font>", body_style))
        if missing_ts:
            ts_str = ", ".join(missing_ts)
            kg_items.append(Paragraph(f"<b>Missing Tech Stack:</b> <font color='#DC2626'>{ts_str}</font>", body_style))

        kg_data = [[item] for item in kg_items]
        kg_table = Table(kg_data, colWidths=[540])
        kg_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), BG_LIGHT),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ])
        )
        story.append(kg_table)
        story.append(Spacer(1, 10))

    # Strengths & Recommendations
    strengths = evaluation_data.get("key_strengths") or []
    recommendations = evaluation_data.get("skill_recommendations") or evaluation_data.get("areas_for_improvement") or []

    if strengths or recommendations:
        story.append(Paragraph("Key Strengths & Skill Recommendations", section_heading))
        str_para_list = []
        if strengths:
            str_para_list.append(Paragraph("<b>Key Strengths:</b>", body_style))
            for s in strengths:
                str_para_list.append(Paragraph(f"• {s}", bullet_style))

        rec_para_list = []
        if recommendations:
            rec_para_list.append(Paragraph("<b>Recommendations for Improvement:</b>", body_style))
            for r in recommendations:
                rec_para_list.append(Paragraph(f"• {r}", bullet_style))

        rec_data = [
            [
                str_para_list if str_para_list else [Paragraph("N/A", body_style)],
                rec_para_list if rec_para_list else [Paragraph("N/A", body_style)],
            ]
        ]
        rec_table = Table(rec_data, colWidths=[265, 265])
        rec_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), BG_LIGHT),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ])
        )
        story.append(rec_table)
        story.append(Spacer(1, 10))

    # Bonus & Deductions
    bonus = evaluation_data.get("bonus_points") or {}
    deductions = evaluation_data.get("deductions") or {}

    bonus_total = bonus.get("total", 0) if isinstance(bonus, dict) else 0
    ded_total = deductions.get("total", 0) if isinstance(deductions, dict) else 0

    if bonus_total > 0 or ded_total > 0:
        adjustments = []
        if bonus_total > 0:
            breakdown = bonus.get("breakdown", "")
            adjustments.append(Paragraph(f"⭐ <b>Bonus Points (+{bonus_total}):</b> {breakdown}", body_style))
        if ded_total > 0:
            reasons = deductions.get("reasons", "")
            adjustments.append(Paragraph(f"⚠️ <b>Deductions (-{ded_total}):</b> {reasons}", body_style))

        adj_data = [[item] for item in adjustments]
        adj_table = Table(adj_data, colWidths=[540])
        adj_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), BG_LIGHT),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ])
        )
        story.append(adj_table)
        story.append(Spacer(1, 10))

    # Footer Notice
    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=0.5, color=TEXT_MUTED, spaceBefore=0, spaceAfter=8))
    footer_style = ParagraphStyle(
        "FooterText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=TEXT_MUTED,
        alignment=1,
    )
    story.append(Paragraph("Report generated automatically by ATSlens Evaluation Engine", footer_style))

    doc.build(story)
    return buffer.getvalue()
