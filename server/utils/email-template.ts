// Shared type definitions and helper functions for email generation

export const typeDescriptions = {
    D: {
        name: 'Rot',
        color: '#dc3545',
        bgColor: '#fef2f2',
        icon: '🔥',
        traits: ['fordernd', 'entschlossen', 'entschieden', 'zielgerichtet', 'willensstark', 'sachorientiert'],
        description: 'Sie sind eine forsche und direkte Persönlichkeit, die sachorientiert handelt und Herausforderungen mit Entschlossenheit begegnet.',
        strengths: ['Willensstärke', 'Zielstrebigkeit', 'Entscheidungsfreude'],
        challenges: ['Dominanz', 'Forschheit', 'Ungeduld'],
        communication: {
            bodyLanguage: 'forsch, direkt, kontrollierend',
            voice: 'stark, klar, direkt, zielstrebig',
            words: 'Ergebnis, Nutzen'
        }
    },
    I: {
        name: 'Gelb',
        color: '#facc15',
        bgColor: '#fefce8',
        icon: '⭐',
        traits: ['umgänglich', 'enthusiastisch', 'ausdrucksstark', 'dynamisch', 'offen', 'überzeugend'],
        description: 'Sie sind eine enthusiastische und offene Persönlichkeit, die Menschen durch ihre ausdrucksstarke und dynamische Art begeistert.',
        strengths: ['Überzeugungskraft', 'Optimismus', 'Begeisterungsfähigkeit'],
        challenges: ['Detailfokus', 'Beständigkeit', 'Ernsthaftigkeit'],
        communication: {
            bodyLanguage: 'offen, fröhlich, ausdrucksstark',
            voice: 'begeistert, locker, laut, schnell',
            words: 'Spaß, aufregend'
        }
    },
    S: {
        name: 'Grün',
        color: '#22c55e',
        bgColor: '#f0fdf4',
        icon: '🌿',
        traits: ['vertrauensvoll', 'ermutigend', 'mitfühlend', 'geduldig', 'freundlich', 'entspannt'],
        description: 'Sie sind eine herzliche und geduldige Persönlichkeit, die Harmonie schätzt und eine unterstützende Atmosphäre schafft.',
        strengths: ['Teamfähigkeit', 'Loyalität', 'Einfühlungsvermögen'],
        challenges: ['Konfrontationsbereitschaft', 'Veränderungstempo', 'Durchsetzungsvermögen'],
        communication: {
            bodyLanguage: 'zurückhaltend, warm, herzlich',
            voice: 'ruhig, Pausen, zögernd, sanft',
            words: 'Beziehung, Garantien, Versprechen'
        }
    },
    G: {
        name: 'Blau',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        icon: '🎯',
        traits: ['vorsichtig', 'präzise', 'besonnen', 'hinterfragend', 'formal', 'analytisch'],
        description: 'Sie sind eine analytische und präzise Persönlichkeit, die Wert auf Qualität, Fakten und eine besonnene Vorgehensweise legt.',
        strengths: ['Genauigkeit', 'Struktur', 'Qualitätsbewusstsein'],
        challenges: ['Flexibilität', 'Schnelligkeit', 'Emotionalität'],
        communication: {
            bodyLanguage: 'distanziert, kühl',
            voice: 'monoton, ruhig, langsam, nachdenklich',
            words: 'Fakten, ZDF, Sicherheit'
        }
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

    <!-- Communication Style Section -->
    <div style="background: ${typeBg}; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <h3 style="margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; color: #1a1a2e; font-size: 18px;">🗣️ Ihr Kommunikationsstil</h3>
        <p style="margin-bottom: 20px; color: #666; font-size: 14px;">So drücken Sie sich aus und so nehmen andere Sie wahr.</p>
        
        <div style="display: flex; flex-direction: column; gap: 15px;">
            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);">
                <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px;">👋 Körpersprache</span>
                <p style="margin: 0; font-size: 14px; color: #334155; font-weight: 500;">${typeData.communication.bodyLanguage}</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);">
                <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px;">🗣️ Stimme</span>
                <p style="margin: 0; font-size: 14px; color: #334155; font-weight: 500;">${typeData.communication.voice}</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);">
                <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px;">✍️ Bevorzugte Worte</span>
                <p style="margin: 0; font-size: 14px; color: #334155; font-weight: 500;">${typeData.communication.words}</p>
            </div>
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
