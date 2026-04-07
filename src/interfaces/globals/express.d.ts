import { UserAuthenticate } from '../User.interface'

declare global {
    namespace Express {
        interface Request {
            user?: UserAuthenticate
        }
    }
}