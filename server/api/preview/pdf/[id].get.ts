import { db, schema } from '../../../db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Ungültige Ergebnis-ID',
        })
    }

    // Get result from database
    const result = await db.query.results.findFirst({
        where: eq(schema.results.slug, id),
    })

    if (!result) {
        throw createError({
            statusCode: 404,
            message: 'Ergebnis nicht gefunden',
        })
    }

    // Get user email
    const user = await db.query.users.findFirst({
        where: eq(schema.users.id, result.userId),
    })

    // Determine primary type
    const scores = {
        D: result.dScore,
        I: result.iScore,
        S: result.sScore,
        G: result.gScore,
    }

    const primaryType = Object.entries(scores).reduce((a, b) =>
        scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b
    )[0] as 'D' | 'I' | 'S' | 'G'

    // Type data
    const typeData = {
        D: {
            name: 'Dominant',
            icon: '🔥',
            description: 'Sie sind eine durchsetzungsstarke Persönlichkeit, die Herausforderungen liebt und schnelle Entscheidungen trifft. Sie bevorzugen direkte Kommunikation und ergebnisorientiertes Handeln.',
            traits: ['Ergebnisorientiert', 'Entscheidungsfreudig', 'Wettbewerbsorientiert', 'Direkt', 'Zielstrebig', 'Selbstbewusst'],
            strengths: ['Führungsstärke', 'Entschlossenheit', 'Problemlösung', 'Schnelle Entscheidungen'],
            challenges: ['Ungeduld', 'Risikobereitschaft', 'Dominanz', 'Wenig Detailorientierung'],
            communicationStyle: 'direkte, ergebnisorientierte Kommunikation',
            communicationFocus: 'Effizienz und schnelle Resultate',
            communicationAvoid: 'lange Diskussionen ohne klares Ziel',
            interactionTips: 'Seien Sie direkt und kommen Sie schnell zum Punkt. Vermeiden Sie unnötige Details.',
            careerAreas: ['Führungspositionen', 'Unternehmertum', 'Vertrieb und Business Development'],
            workEnvironment: 'Dynamisches Umfeld mit klaren Zielen, Autonomie und Herausforderungen',
            keyStrength: 'Führung und Ergebnisorientierung',
        },
        I: {
            name: 'Initiativ',
            icon: '⭐',
            description: 'Sie sind eine kommunikative und enthusiastische Persönlichkeit, die Menschen begeistert und motiviert. Sie lieben soziale Interaktion und bringen positive Energie in Teams.',
            traits: ['Kommunikativ', 'Enthusiastisch', 'Optimistisch', 'Überzeugend', 'Kreativ', 'Teamorientiert'],
            strengths: ['Kommunikationsfähigkeit', 'Begeisterungsfähigkeit', 'Netzwerken', 'Kreativität'],
            challenges: ['Impulsivität', 'Detailschwäche', 'Überoptimismus', 'Schwierigkeiten mit Routine'],
            communicationStyle: 'lebhafte, begeisternde Kommunikation',
            communicationFocus: 'Beziehungen und positive Atmosphäre',
            communicationAvoid: 'zu formelle oder trockene Kommunikation',
            interactionTips: 'Seien Sie freundlich und zeigen Sie Interesse an der Person, nicht nur am Thema.',
            careerAreas: ['Marketing und PR', 'Vertrieb und Kundenbetreuung', 'Event Management'],
            workEnvironment: 'Soziales, dynamisches Umfeld mit viel Interaktion und Abwechslung',
            keyStrength: 'Kommunikation und Begeisterung',
        },
        S: {
            name: 'Stetig',
            icon: '🤝',
            description: 'Sie sind eine zuverlässige und harmonieorientierte Persönlichkeit, die Stabilität schätzt und ein ausgezeichneter Teamplayer ist. Sie arbeiten geduldig und unterstützen andere.',
            traits: ['Zuverlässig', 'Geduldig', 'Loyal', 'Unterstützend', 'Harmoniebedürftig', 'Beständig'],
            strengths: ['Teamfähigkeit', 'Zuverlässigkeit', 'Geduld', 'Loyalität'],
            challenges: ['Veränderungsresistenz', 'Konfliktscheu', 'Schwierigkeiten Nein zu sagen', 'Langsame Entscheidungen'],
            communicationStyle: 'ruhige, unterstützende Kommunikation',
            communicationFocus: 'Harmonie und Zusammenarbeit',
            communicationAvoid: 'Konfrontation und plötzliche Veränderungen',
            interactionTips: 'Geben Sie Zeit für Entscheidungen und schaffen Sie eine sichere Atmosphäre.',
            careerAreas: ['Kundenservice', 'Soziale Berufe', 'Teamkoordination'],
            workEnvironment: 'Stabiles, harmonisches Umfeld mit klaren Strukturen und Teamarbeit',
            keyStrength: 'Zuverlässigkeit und Teamarbeit',
        },
        G: {
            name: 'Gewissenhaft',
            icon: '📊',
            description: 'Sie sind eine analytische und detailorientierte Persönlichkeit, die Wert auf Genauigkeit und Qualität legt. Sie arbeiten systematisch und bevorzugen klare Strukturen und Prozesse.',
            traits: ['Analytisch', 'Präzise', 'Systematisch', 'Qualitätsbewusst', 'Objektiv', 'Zuverlässig'],
            strengths: ['Hohe Qualitätsstandards', 'Analytisches Denken', 'Detailgenauigkeit', 'Systematische Arbeitsweise'],
            challenges: ['Perfektionismus', 'Entscheidungszögerung', 'Kritische Haltung', 'Schwierigkeiten mit Veränderungen'],
            communicationStyle: 'sachliche, faktenbasierte Kommunikation',
            communicationFocus: 'Genauigkeit und Qualität',
            communicationAvoid: 'oberflächliche oder ungenaue Informationen',
            interactionTips: 'Liefern Sie Fakten und Details. Geben Sie Zeit für gründliche Analyse.',
            careerAreas: ['Analyse und Forschung', 'Qualitätsmanagement', 'Technische Berufe'],
            workEnvironment: 'Strukturiertes Umfeld mit klaren Prozessen und hohen Qualitätsstandards',
            keyStrength: 'Analyse und Qualität',
        },
    }

    const data = typeData[primaryType]
    const name = user?.email?.split('@')[0] || 'Teilnehmer'
    const date = new Date().toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    // Load PDF template using Nitro's storage API for serverless compatibility
    const storage = useStorage('assets:templates')
    let html = await storage.getItem('pdf-template.html') as string

    if (!html) {
        throw createError({
            statusCode: 500,
            message: 'Template nicht gefunden',
        })
    }

    // Replace placeholders
    html = html
        .replace(/{{NAME}}/g, name)
        .replace(/{{DATE}}/g, date)
        .replace(/{{D_SCORE}}/g, scores.D.toString())
        .replace(/{{I_SCORE}}/g, scores.I.toString())
        .replace(/{{S_SCORE}}/g, scores.S.toString())
        .replace(/{{G_SCORE}}/g, scores.G.toString())
        .replace(/{{PRIMARY_TYPE_NAME}}/g, data.name)
        .replace(/{{PRIMARY_TYPE_ICON}}/g, data.icon)
        .replace(/{{PRIMARY_TYPE_DESCRIPTION}}/g, data.description)
        .replace(/{{COMMUNICATION_STYLE}}/g, data.communicationStyle)
        .replace(/{{COMMUNICATION_FOCUS}}/g, data.communicationFocus)
        .replace(/{{COMMUNICATION_AVOID}}/g, data.communicationAvoid)
        .replace(/{{INTERACTION_TIPS}}/g, data.interactionTips)
        .replace(/{{CAREER_AREA_1}}/g, data.careerAreas[0])
        .replace(/{{CAREER_AREA_2}}/g, data.careerAreas[1])
        .replace(/{{CAREER_AREA_3}}/g, data.careerAreas[2])
        .replace(/{{WORK_ENVIRONMENT}}/g, data.workEnvironment)
        .replace(/{{KEY_STRENGTH}}/g, data.keyStrength)
        .replace(/{{RESULT_URL}}/g, `${getRequestURL(event).origin}/result/${id}`)

    // Replace traits array (simple approach)
    const traitsHtml = data.traits.map(t => `<div class="trait-badge">${t}</div>`).join('\n                ')
    html = html.replace(/{{#each TRAITS}}[\s\S]*?{{\/each}}/g, traitsHtml)

    // Replace strengths array
    const strengthsHtml = data.strengths.map(s => `<li>${s}</li>`).join('\n                        ')
    html = html.replace(/{{#each STRENGTHS}}[\s\S]*?{{\/each}}/g, strengthsHtml)

    // Replace challenges array
    const challengesHtml = data.challenges.map(c => `<li>${c}</li>`).join('\n                        ')
    html = html.replace(/{{#each CHALLENGES}}[\s\S]*?{{\/each}}/g, challengesHtml)

    // Return HTML with proper content type
    setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
    return html
})
