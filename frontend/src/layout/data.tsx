export interface Event {
    id: number,         // Unique globally
    name: string,
    stepId: number      // Which step it belongs to
}

export interface Connection {
    from: number,       // Event ID
    to: number          // Event ID
}

export const Events: Event[] = [
    { id: 0, name: 'Grójec', stepId: 0 },
    { id: 1, name: 'Warsaw', stepId: 1 },
    { id: 2, name: 'Germany', stepId: 1 },
    { id: 3, name: 'Vienna', stepId: 1 },
    { id: 4, name: 'Tirana', stepId: 2 },
    { id: 5, name: 'Skopje', stepId: 2 },
    { id: 6, name: 'Ohrid', stepId: 3 },
]

// export const Steps: Step[] = [
//     { id: 0 }, // Step 1 has Germany, Warsaw, and Vienna
//     { id: 1 }, // Step 2 has Skopje and Tirana
//     { id: 2 }, // Step 3 has Ohrid
//     { id: 3 }
// ]

export const Connections: Connection[] = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 0, to: 3 },
    { from: 1, to: 4 }, // Warsaw -> Tirana
    { from: 2, to: 5 }, // Germany -> Skopje
    { from: 2, to: 4 }, // Germany -> Skopje
    { from: 5, to: 6 }, // Skopje -> Ohrid
    { from: 4, to: 6 }, // Tirana -> Ohrid
    { from: 3, to: 6 }, // Vienna -> Ohrid
]