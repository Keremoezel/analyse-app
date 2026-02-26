import puppeteer from 'puppeteer'

// Extend window object to include print function if needed
declare global {
    interface Window {
        print: () => void
    }
}

export async function generatePdf(html: string): Promise<Buffer> {
    let browser

    try {
        browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
            ],
            headless: true,
        })

        const page = await browser.newPage()

        await page.setContent(html, {
            waitUntil: 'networkidle0',
        })

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            tagged: true,
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px',
            },
        })

        return Buffer.from(pdf)

    } catch (error: any) {
        console.error('Error generating PDF:', error)
        throw new Error(`Failed to generate PDF: ${error.message}`)
    } finally {
        if (browser) {
            await browser.close()
        }
    }
}
