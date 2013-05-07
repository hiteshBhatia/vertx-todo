package com.intelligrape.vertx.todo

def webServerConf = [
        port: 8080,
        host: 'localhost',
        bridge: true,

        // This defines which messages from the client we will let through
        // to the server side
        inbound_permitted: [
                [
                        address: 'vertx.mongopersistor',
                        match: [
                                collection: 'todos'
                        ]
                ],
                [
                        address: 'vertx.basicauthmanager.login'
                ],
                [
                        address: 'vertx.basicauthmanager.authorise'
                ],
                [
                        address: "vertx.controller.user"
                ]
        ],

        // This defines which messages from the server we will let through to the client
        outbound_permitted: [
                [:]
        ]
]

def authMgrConf = [
        "user_collection": "todos",
        "session_timeout": 900000
]


container.with {
    deployModule('vertx.mongo-persistor-v1.2', ["repo": "vert-x.github.io", "db_name": "todo_list"], 1) {
        deployVerticle('src/main/groovy/com/intelligrape/vertx/todo/StaticData.groovy', null, 1, {})
    }

    deployModule('vertx.auth-mgr-v1.1', authMgrConf, 1) {
        println "Auth Manager in place"

    }

    deployModule('vertx.web-server-v1.0', webServerConf, 1) {
        println "Server running at http://localhost:${webServerConf['port']}"
    }

    deployVerticle('src/main/groovy/com/intelligrape/vertx/todo/UserController.groovy', null, 1, {})
}




