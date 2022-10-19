import express from 'express'
import { PrismaClient} from '@prisma/client'
import cors from 'cors'
import { convertHourStringToMinutes } from './utils/convert-hour-string-to-minutes'
import { convertMinutesToHourStrings } from './utils/convert-minutes-to-hour-strings'

const app = express()
const prisma = new PrismaClient({
    log: ['query']
})

app.use(express.json())
app.use(cors())

app.get('/games', async (req, res) => {

    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                }
            }
        }
    })

    return res.json(games);
});

app.post('/games/:id/ads', async (req, res) => {

    const gameId = req.params.id;
    const body : any = req.body;

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourStart: convertHourStringToMinutes(body.hourStart),
            hourEnd: convertHourStringToMinutes(body.hourEnd),
            userVoiceChannel: body.userVoiceChannel,

        }
    })

    return res.status(201).json(body);
});

app.get('/games/:id/ads', async (req, res) => {

    const gameId = req.params.id;

    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            userVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true,
        },
        where: {
            gameId,
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return res.json(ads.map(ad => {
        return {
        ...ad,
        weekDays: ad.weekDays.split(','),
        hourStart: convertMinutesToHourStrings(ad.hourStart),
        hourEnd: convertMinutesToHourStrings(ad.hourEnd),
        }
    }))
})

app.get('/ads/:id/discord', async (req, res) => {

    const adId = req.params.id;

    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where: {
            id: adId,
        }
    })

    return res.json({
        discord: ad.discord,
    })
})

app.listen(3333)

