import { User } from '../User.interface'

declare global {
    namespace Express {
        interface Request {
            user?: Omit<User, 'password'>
        }
    }
}