/**
 * Shared email signature for all outgoing emails from power4-people.
 * The logo uses the production URL so it displays correctly in all email clients.
 * When running locally, the logo won't display in emails (localhost is not accessible).
 */
export function getEmailSignatureHTML(): string {
    // Use the production URL for the logo - it must be publicly accessible for email clients
    // Locally the logo won't display (email clients can't access localhost)
    const config = useRuntimeConfig()
    const siteUrl = (config.public?.siteUrl as string) || 'https://analyseapp.vercel.app'
    const logoUrl = `${siteUrl}/signature.png`

    return `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #667eea; font-family: Arial, sans-serif; font-size: 13px; color: #333; line-height: 1.5;">
            <p style="margin: 0 0 5px 0; font-size: 13px; color: #555;">
                Mit freundlichen Grüßen / With kind regards
            </p>
            <p style="margin: 0 0 15px 0; font-weight: bold; color: #333;">
                Ihr power4-people Team
            </p>

            <p style="margin: 0 0 15px 0;">
                <img src="${logoUrl}" alt="power4-people – People & Team Performance" style="max-width: 250px; height: auto;" />
            </p>

            <table cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: #333;">
                <tr>
                    <td style="padding-bottom: 10px;">
                        <strong style="color: #667eea; font-size: 14px;">power4-people</strong><br>
                        <span style="font-size: 12px; color: #888;">eine Unternehmung der power4-group GmbH</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding-bottom: 10px;">
                        Am Kirschenäcker 1<br>
                        36148 Kalbach
                    </td>
                </tr>
                <tr>
                    <td style="padding-bottom: 10px;">
                        Telefon: <a href="tel:+4997429302" style="color: #667eea; text-decoration: none;">+49 (0) 9742 93022</a><br>
                        E-Mail: <a href="mailto:kurzanalyse@power4-people.de" style="color: #667eea; text-decoration: none;">kurzanalyse@power4-people.de</a><br>
                        Web: <a href="https://www.power4-people.de" style="color: #667eea; text-decoration: none;">www.power4-people.de</a>
                    </td>
                </tr>
            </table>

            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee; font-size: 11px; color: #999; line-height: 1.4;">
                <p style="margin: 0 0 5px 0;">
                    USt-Ident-Nr.: DE 335 905 517 | Amtsgericht: Fulda, HRB 7849<br>
                    Geschäftsführung: Michael Asmussen, Knut Halder
                </p>
                <p style="margin: 10px 0 0 0;">
                    Die übermittelte Information ist nur für die Person oder das Unternehmen bestimmt, an die sie gerichtet ist, und kann vertrauliche oder bevorrechtigte Daten enthalten. Jede Art der Überprüfung, Weitersendung oder Verbreitung sowie jede Verwendung der Information durch andere Personen oder Unternehmen als den angegebenen Adressaten ist verboten. Falls Sie diese Nachricht irrtümlich erhalten haben, setzen Sie sich bitte mit dem Absender in Verbindung und löschen das Material aus jedem Computer.
                </p>
                <p style="margin: 5px 0 0 0;">
                    This e-mail may contain confidential and/or privileged information. If you are not the intended recipient (or have received this e-mail in error) please notify the sender immediately and destroy this e-mail. Any unauthorised copying, disclosure or distribution of the material in this e-mail is strictly forbidden.
                </p>
            </div>
        </div>
    `.trim()
}
