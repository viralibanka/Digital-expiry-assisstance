function downloadPDF() {

    const token = localStorage.getItem("token");

    console.log("Token =", token);

    fetch(`${API_URL}/products/export-pdf`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(async response => {

        console.log("Status:", response.status);

        if (!response.ok) {
            const text = await response.text();
            console.log("Error:", text);
            throw new Error("Unauthorized");
        }

        return response.blob();

    })
    .then(blob => {

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;
        a.download = "expiryvault_products.pdf";

        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);

    })
    .catch(error => {
        console.log(error);
    });
}