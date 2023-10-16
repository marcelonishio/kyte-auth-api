import logdna from '@logdna/logger'

/**
 * Cria instância para serviço de LOG
 * Utiliza o serviço LogDNA para registro
 * https://www.mezmo.com/
 */

export interface LoggerInterface {
    trace: Function,
    debug: Function,
    info: Function,
    warn: Function,
    error: Function,
    fatal: Function,
}

const createLogger = async (
    { key, appName, localOutput }:
        { key: string, appName: string, localOutput: boolean }
): Promise<LoggerInterface> => {
    let getFunction, logDna

    if (localOutput) {
        /**
         * Construção de método para output local (console.log)
         */
        getFunction = (type: string): Function => {
            const COLORS: object = {
                trace: '47m',
                info: '46m',
                warn: '43m',
                error: '41m',
            }
            return (message: string, payload: object) => {
                let color = COLORS[type as keyof typeof COLORS]
                console.log(`\x1b[${color}${type.toUpperCase()}: ${message}\x1b[0m`)
                if (type === 'error' && payload?.stack) {
                    console.log(`\x1b[${color}=== STACK ===>: ${payload.stack}\x1b[0m`)
                    delete payload.stack
                }
                if (payload) {
                    console.log(`\x1b[${color}\x1b[2m${JSON.stringify(payload)}\x1b[0m`)
                }
            }
        }
    } else {
        /**
         * Construção de log via LogDna
         */
        const logdnaConn = logdna.createLogger(key, {
            app: appName,
            indexMeta: true,
            level: 'debug'
        })
        getFunction = (type: string): Function => {
            return (message: string, payload: object) => {
                let options = payload ? { meta: payload } : {}
                logdnaConn[type](message, options)
            }
        }
    }
    
    return {
        trace: getFunction('trace'),
        debug: getFunction('trace'),
        info: getFunction('info'),
        warn: getFunction('warn'),
        error: getFunction('error'),
        fatal: getFunction('error'),
    }
}

export default createLogger