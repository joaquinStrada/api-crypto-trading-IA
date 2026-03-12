const parseExpiressIn = (expiressIn: string): number => {
    if (expiressIn.endsWith('d')) return parseInt(expiressIn.slice(0, -1)) * 24 * 60 * 60 * 1000

    if (expiressIn.endsWith('h')) return parseInt(expiressIn.slice(0, -1)) * 60 * 60 * 1000

    if (expiressIn.endsWith('m')) return parseInt(expiressIn.slice(0, -1)) * 60 * 1000

    if (expiressIn.endsWith('s')) return parseInt(expiressIn.slice(0, -1)) * 1000

    if (expiressIn.endsWith('ms')) return parseInt(expiressIn.slice(0, -2))

    return 0
}

export default parseExpiressIn