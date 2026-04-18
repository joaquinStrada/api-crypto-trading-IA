export interface Bot {
    id?: string,
    createdAt?: Date,
    name: string,
    description: string,
    model: string,
    deployId?: string,
    status?: string,
    userId?: string
}