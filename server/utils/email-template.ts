// Shared type definitions and helper functions for email generation

export const typeDescriptions = {
    D: {
        name: 'Rot',
        color: '#dc3545',
        bgColor: '#fef2f2',
        icon: '🔥',
        traits: ['Ergebnisorientiert', 'Entscheidungsfreudig', 'Wettbewerbsorientiert', 'Direkt', 'Zielstrebig'],
        description: 'Sie sind eine durchsetzungsstarke Persönlichkeit, die Herausforderungen liebt und schnelle Entscheidungen trifft.',
        strengths: ['Führungsstärke', 'Entschlossenheit', 'Problemlösung'],
        challenges: ['Ungeduld', 'Risikobereitschaft', 'Dominanz'],
    },
    I: {
        name: 'Gelb',
        color: '#facc15',
        bgColor: '#fefce8',
        icon: '⭐',
        traits: ['Enthusiastisch', 'Optimistisch', 'Kontaktfreudig', 'Überzeugend', 'Kreativ'],
        description: 'Sie sind eine inspirierende Persönlichkeit, die Menschen begeistert und gerne im Mittelpunkt steht.',
        strengths: ['Kommunikation', 'Motivation', 'Networking'],
        challenges: ['Detailarbeit', 'Zeitmanagement', 'Fokus'],
    },
    S: {
        name: 'Grün',
        color: '#22c55e',
        bgColor: '#f0fdf4',
        icon: '🌿',
        traits: ['Geduldig', 'Zuverlässig', 'Teamfähig', 'Unterstützend', 'Loyal'],
        description: 'Sie sind eine harmonische Persönlichkeit, die Stabilität schätzt und anderen hilft.',
        strengths: ['Teamarbeit', 'Zuhören', 'Beständigkeit'],
        challenges: ['Veränderungen', 'Konfrontation', 'Tempo'],
    },
    G: {
        name: 'Blau',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        icon: '🎯',
        traits: ['Analytisch', 'Genau', 'Strukturiert', 'Qualitätsbewusst', 'Planend'],
        description: 'Sie sind eine präzise Persönlichkeit, die Qualität und Genauigkeit über alles stellt.',
        strengths: ['Analyse', 'Planung', 'Qualitätssicherung'],
        challenges: ['Perfektionismus', 'Überanalyse', 'Kritik'],
    },
}

export function generateResultEmailHTML(data: any) {
    const { typeData, scores, secondaryType, origin, resultUrl } = data
    const typeColor = typeData.color
    const typeBg = typeData.bgColor

    // Generate Traits List HTML
    const traitsHtml = typeData.traits.map((trait: string) =>
        `<span style="display:inline-block; padding: 4px 12px; border: 2px solid ${typeColor}; border-radius: 20px; font-size: 14px; font-weight: 500; color: ${typeColor}; margin: 4px;">${trait}</span>`
    ).join('')

    // Generate Score Bars HTML
    const scoreBarsHtml = Object.entries(scores).map(([type, score]) => {
        const typeInfo = typeDescriptions[type as keyof typeof typeDescriptions]
        return `
        <div style="margin-bottom: 12px;">
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="display:inline-block; width: 20px; height: 20px; background: ${typeInfo.color}; border-radius: 4px; margin-right: 8px;"></span>
                <span style="font-weight: bold; color: #333; min-width: 40px;">${typeInfo.name}</span>
                <span style="margin-left: auto; font-weight: bold; color: #555;">${score}</span>
            </div>
            <div style="background: #eee; border-radius: 4px; height: 12px; overflow: hidden;">
                <div style="width: ${score}%; background: ${typeInfo.color}; height: 100%;"></div>
            </div>
        </div>`
    }).join('')

    // Generate Strengths HTML
    const strengthsHtml = typeData.strengths.map((s: string) => `<li style="margin-bottom: 6px;">${s}</li>`).join('')

    // Generate Challenges HTML
    const challengesHtml = typeData.challenges.map((c: string) => `<li style="margin-bottom: 6px;">${c}</li>`).join('')

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ihr Analyse-Ergebnis</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f7fa;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 60px; height: 60px; border-radius: 50%; background: ${typeColor}; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; line-height: 60px; font-size: 30px; color: white;">
            ${typeData.icon}
        </div>
        <h1 style="color: #1a1a2e; margin: 0 0 5px;">Ihr Analyse-Profil</h1>
        <p style="color: #666; margin: 0;">Hier ist Ihre persönliche Auswertung</p>
    </div>

    <!-- Main Result Card -->
    <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 20px; border-left: 5px solid ${typeColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
            <div style="width: 50px; height: 50px; border-radius: 10px; background: ${typeColor}; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">
                ${data.dominantType}
            </div>
            <div>
                <h2 style="margin: 0; font-size: 22px;">${typeData.name}</h2>
                <p style="margin: 0; color: #555;">${typeData.description}</p>
            </div>
        </div>
        
        <div style="margin-top: 20px;">
            ${traitsHtml}
        </div>
    </div>

    <!-- Scores Section -->
    <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <h3 style="margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Ihr Stärkenprofil</h3>
        ${scoreBarsHtml}
    </div>

    <!-- Analysis Section (Split) -->
    <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
        <!-- Strengths -->
        <div style="flex: 1; min-width: 250px; background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <h4 style="margin-top: 0; color: #28a745;">💪 Ihre Stärken</h4>
            <ul style="padding-left: 20px; margin-bottom: 0;">
                ${strengthsHtml}
            </ul>
        </div>
        
        <!-- Challenges -->
        <div style="flex: 1; min-width: 250px; background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <h4 style="margin-top: 0; color: #dc3545;">🎯 Entwicklungsfelder</h4>
            <ul style="padding-left: 20px; margin-bottom: 0;">
                ${challengesHtml}
            </ul>
        </div>
    </div>

    <!-- Secondary Type -->
    ${secondaryType ? `
    <div style="background: ${secondaryType.bgColor}; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid ${secondaryType.color}40;">
        <h3 style="margin-top: 0; color: #333;">Ihre Sekundärfarbe: ${secondaryType.name}</h3>
        <p style="margin-bottom: 0; color: #555;">${secondaryType.description}</p>
    </div>
    ` : ''}

    <!-- Footer / Details -->
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; background: #f8f9fa; border-radius: 8px; padding: 20px;">
        <h3 style="margin-top: 0; color: #1a1a2e; font-size: 18px; text-align: center;">🎯 Möchten Sie mehr erfahren?</h3>
        <p style="font-size: 14px; color: #555; line-height: 1.6; text-align: center;">
            Wenn Sie eine detaillierte Analyse interessiert, Sie Handlungsempfehlungen haben möchten, Ihnen Ihre Motivatoren wichtig sind und Sie Spaß an Informationen zu Ihrem IQ haben, dann kontaktieren Sie uns gerne für eine ausführliche Auswertung.
        </p>
        
        <p style="font-size: 12px; color: #999; margin-top: 20px; text-align: center;">
            © ${new Date().getFullYear()} Power4-people Kurzanalyse
        </p>
    </div>

</body>
</html>
    `.trim()
}
