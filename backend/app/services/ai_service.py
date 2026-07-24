from datetime import date


def generate_ai_response(question: str, products: list):

    question = question.lower()

    if "expire" in question or "expiring" in question:

        expiring = []

        today = date.today()

        for product in products:

            days = (product.expiry_date - today).days

            if days >= 0 and days <= 7:

                expiring.append(
                    f"{product.product_name} expires in {days} day(s)"
                )

        if expiring:

            return "\n".join(expiring)

        return "No products are expiring within the next 7 days."



    elif "dairy" in question:

        dairy = [
            p.product_name
            for p in products
            if p.category.lower() == "dairy"
        ]

        if dairy:

            return "Dairy products: " + ", ".join(dairy)

        return "No dairy products found."



    elif "total" in question:

        return f"You currently have {len(products)} products."



    elif "use first" in question or "consume first" in question:

        if len(products) == 0:

            return "No products available."

        earliest = min(products, key=lambda x: x.expiry_date)

        return (
            f"You should use '{earliest.product_name}' first "
            f"because it expires on {earliest.expiry_date}."
        )



    return (
        "I can answer questions like:\n"
        "- Which products expire this week?\n"
        "- Which product should I use first?\n"
        "- How many products do I have?\n"
        "- Show dairy products."
    )