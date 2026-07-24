from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO


def generate_products_pdf(products):

    buffer = BytesIO()

    pdf = SimpleDocTemplate(
        buffer,
        pagesize=letter
    )

    elements = []

    styles = getSampleStyleSheet()

    title = Paragraph(
        "ExpiryVault Product Inventory Report",
        styles["Title"]
    )

    elements.append(title)
    elements.append(Spacer(1, 20))


    data = [
        [
            "ID",
            "Product Name",
            "Category",
            "Quantity",
            "Manufacture Date",
            "Expiry Date"
        ]
    ]


    for product in products:

        data.append([
            product.id,
            product.product_name,
            product.category,
            product.quantity,
            str(product.manufacture_date),
            str(product.expiry_date)
        ])


    table = Table(data)

    table.setStyle(
        TableStyle([
            ("GRID", (0,0), (-1,-1), 1, None),
            ("ALIGN", (0,0), (-1,-1), "CENTER")
        ])
    )


    elements.append(table)

    pdf.build(elements)

    buffer.seek(0)

    return buffer