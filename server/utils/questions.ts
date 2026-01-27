// DISG Test Questions - 10 rows with 4 adjectives each
// Each adjective maps to D, I, S, or G

export type DisgType = 'D' | 'I' | 'S' | 'G'

export interface Adjective {
    word: string
    type: DisgType
}

export interface QuestionRow {
    id: number
    adjectives: Adjective[]
}

export const DISG_QUESTIONS: QuestionRow[] = [
    {
        id: 1,
        adjectives: [
            { word: 'optimistisch', type: 'I' },
            { word: 'selbstsicher', type: 'D' },
            { word: 'genau', type: 'G' },
            { word: 'harmonisch', type: 'S' },
        ],
    },
    {
        id: 2,
        adjectives: [
            { word: 'ergebnisorientiert', type: 'D' },
            { word: 'beständig', type: 'S' },
            { word: 'enthusiastisch', type: 'I' },
            { word: 'selbstdiszipliniert', type: 'G' },
        ],
    },
    {
        id: 3,
        adjectives: [
            { word: 'nachdenkend', type: 'G' },
            { word: 'kontaktfreudig', type: 'I' },
            { word: 'zuhörend', type: 'S' },
            { word: 'wagemutig', type: 'D' },
        ],
    },
    {
        id: 4,
        adjectives: [
            { word: 'positiv', type: 'I' },
            { word: 'risikofreudig', type: 'D' },
            { word: 'zurückhaltend', type: 'G' },
            { word: 'unterstützend', type: 'S' },
        ],
    },
    {
        id: 5,
        adjectives: [
            { word: 'geduldig', type: 'S' },
            { word: 'spontan', type: 'I' },
            { word: 'entscheidungsfreudig', type: 'D' },
            { word: 'kontrolliert', type: 'G' },
        ],
    },
    {
        id: 6,
        adjectives: [
            { word: 'kritisch', type: 'G' },
            { word: 'impulsiv', type: 'I' },
            { word: 'zuverlässig', type: 'S' },
            { word: 'zielorientiert', type: 'D' },
        ],
    },
    {
        id: 7,
        adjectives: [
            { word: 'gesellig', type: 'I' },
            { word: 'unauffällig', type: 'S' },
            { word: 'furchtlos', type: 'D' },
            { word: 'strukturiert', type: 'G' },
        ],
    },
    {
        id: 8,
        adjectives: [
            { word: 'bestimmend', type: 'D' },
            { word: 'sorgfältig', type: 'G' },
            { word: 'teamfähig', type: 'S' },
            { word: 'begeistert', type: 'I' },
        ],
    },
    {
        id: 9,
        adjectives: [
            { word: 'vertrauensvoll', type: 'S' },
            { word: 'analytisch', type: 'G' },
            { word: 'beliebt', type: 'I' },
            { word: 'kraftvoll', type: 'D' },
        ],
    },
    {
        id: 10,
        adjectives: [
            { word: 'hartnäckig', type: 'D' },
            { word: 'überzeugend', type: 'I' },
            { word: 'planend', type: 'G' },
            { word: 'vermittelnd', type: 'S' },
        ],
    },
]

// Helper to get flattened adjective-to-type mapping
export function getAdjectiveMapping(): Record<string, DisgType> {
    const mapping: Record<string, DisgType> = {}
    for (const row of DISG_QUESTIONS) {
        for (const adj of row.adjectives) {
            mapping[adj.word] = adj.type
        }
    }
    return mapping
}
