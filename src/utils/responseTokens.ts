import { Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from './config'
import parseExpiressIn from './parseExpiressIn'

export const responseTokens = (res: Response, userId: string, remember: boolean): Response => {
    const accessToken = jwt.sign({ userId }, config.jwt.accessTokenSecret as string, { 
      expiresIn: config.jwt.accessTokenExpiration 
    } as any)

    const refreshToken = jwt.sign({ userId, remember }, config.jwt.refreshTokenSecret as string, { 
      expiresIn: remember ? config.jwt.refreshTokenExpiration : config.jwt.refreshTokenExpirationNoRemember 
    } as any)

    return res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.express.secure,
      sameSite: config.express.sameSite
    }).json({
      error: false,
      data: {
        accessToken,
        expiressInAccessToken: parseExpiressIn(config.jwt.accessTokenExpiration),
        expiressInRefreshToken: parseExpiressIn(remember ? config.jwt.refreshTokenExpiration : config.jwt.refreshTokenExpirationNoRemember)
      }
    })
}

export const responseAccessToken = (res: Response, userId: string): Response => {
  const accessToken = jwt.sign({ userId }, config.jwt.accessTokenSecret as string, { 
      expiresIn: config.jwt.accessTokenExpiration 
    } as any)

    return res.json({
      error: false,
      data: {
        accessToken,
        expiressInAccessToken: parseExpiressIn(config.jwt.accessTokenExpiration)
      }
    })
}