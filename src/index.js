
let args = process.argv.slice(2);

const eventId = parseInt(args.shift());
const sessionId = args.shift();
const token = args.shift()

console.log(`Event ID: ${eventId}`)
console.log(`Session ID: ${sessionId}`)

const getTickets = async () => {
    return fetch(`https://event-page.svc.sympla.com.br/api/event-bff/purchase/event/${eventId}/tickets`, {
        method: 'GET',
        headers: {
            accept: '*/*',
            'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            origin: 'https://www.sympla.com.br',
            pragma: 'no-cache',
            priority: 'u=1, i',
            referer: 'https://www.sympla.com.br/',
            'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Opera GX";v="112"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 OPR/112.0.0.0'
        }
    })
        .then(res => res.json())
}

const reserveTicket = async (ticketId) => {
    return fetch('https://event-page.svc.sympla.com.br/api/event-bff/purchase/event/2571425/tickets/reservation', {
        method: 'POST',
        headers: {
            accept: '*/*',
            'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            origin: 'https://www.sympla.com.br',
            pragma: 'no-cache',
            priority: 'u=1, i',
            referer: 'https://www.sympla.com.br/',
            'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Opera GX";v="112"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 OPR/112.0.0.0',
        },
        body: JSON.stringify({
            tickets: [{ qty: 1, ticketId: ticketId }],
            eventId: eventId,
            sessionIdBuyer: sessionId
        })
    })
        .then(res => res.json())
}

const placeOrder = async (reservationToken, temporaryId) => {
    return fetch('https://simple-gql-proxy.svc.sympla.com.br/v1/proxy/execute', {
        method: 'POST',
        headers: {
            accept: '*/*',
            'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            origin: 'https://www.sympla.com.br',
            pragma: 'no-cache',
            priority: 'u=1, i',
            referer: 'https://www.sympla.com.br/',
            'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Opera GX";v="112"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 OPR/112.0.0.0',
            authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
            "operationName": "CreatePixOrder",
            "variables": {
                "order": {
                    "payment": {
                        "type": "pix",
                        "saveNonSensibleData": false,
                        "purchaser": {
                            // TODO: Get account cpf
                            "document": "",
                            "documentType": "CPF"
                        }
                    },
                    "eventId": eventId,
                    "processorFee": 0,
                    "reservationToken": reservationToken,
                    "language": "PT",
                    "device": "DESKTOP",
                    "buyer": {
                        "firstName": firstName,
                        "lastName": lastName,
                        "email": email
                    },
                    "participants": [
                        {
                            "temporaryId": temporaryId,
                            "firstName": firstName,
                            "lastName": lastName,
                            "email": email,
                            // TODO: get and answer the questions on the form
                            "customFormFields": []
                        }
                    ],
                    "sessionIdBuyer": sessionId,
                    "invitationToken": null,
                    "utm": {
                        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
                    }
                }
            },
            "query": "mutation CreatePixOrder($order: RouterSimpleOrderCreatePixInput!) {\n  orderMutation: RouterSimpleOrderCreatePix(order: $order) {\n    result\n    orderNum\n    downloadOrderPdf\n    orderStatus\n    accessToken\n    totalOrder {\n      integer\n      decimal\n      __typename\n    }\n    symplaFee {\n      integer\n      decimal\n      __typename\n    }\n    installmentFee {\n      integer\n      decimal\n      __typename\n    }\n    netValue {\n      integer\n      decimal\n      __typename\n    }\n    payment {\n      type\n      pixCode\n      qrCodeImg\n      expirationTime\n      expirationTimeInTimestamp\n      responseTimeInTimestamp\n      __typename\n    }\n    validationErrors {\n      section\n      temporaryId\n      fields {\n        fieldName\n        errors\n        __typename\n      }\n      __typename\n    }\n    encryptedHash\n    needToCheckStatus\n    userAccountStatus\n    __typename\n  }\n}\n"
        })
    })
        .then(res => res.json())
}

const check = async () => {

    console.log('Checking tickets availability...')
    const tickets = await getTickets();

    for (const ticket of tickets) {
        if (ticket.availableQty > 0) {
            console.log(`Reservando ticket ${ticket.name}`)
            const reservation = await reserveTicket(ticket.id)
            if (reservation.data) {
                const reservationToken = reservation.data.GRSimpleReservation.reservationToken
                const temporaryId = reservation.data.GRSimpleReservation.participants[0].temporaryId
                console.log(`Ticket reservado com sucesso! Token: ${reservationToken}, Temporary ID: ${temporaryId}`)
                console.log(await placeOrder(reservationToken, temporaryId))
            }
            return
        }
    }

    setTimeout(check, 500)
}

check()
