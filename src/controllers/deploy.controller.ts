import { Request, Response } from 'express'

export const getDeploys = async (req: Request, res: Response): Promise<Response | void> => {
    res.json({ message: 'Get deploys' })
}

export const getDeploy = async (req: Request, res: Response): Promise<Response | void> => {
    res.json({ message: 'Get deploy' })
}

export const createDeploy = async (req: Request, res: Response): Promise<Response | void> => {
    res.json({ message: 'Create deploy' })
}

export const updateDeploy = async (req: Request, res: Response): Promise<Response | void> => {
    res.json({ message: 'Update deploy' })
}

export const deleteDeploy = async (req: Request, res: Response): Promise<Response | void> => {
    res.json({ message: 'Delete deploy' })
}