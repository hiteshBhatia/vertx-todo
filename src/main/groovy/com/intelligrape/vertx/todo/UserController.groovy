package com.intelligrape.vertx.todo

def eb = vertx.eventBus
def log = container.logger


def customHandler = { data ->
    if (data.body.action in ['register']) {
        def methodName = data.body.remove("action")
        "${methodName}"(data.body, eb)
    }
    data.reply(["status": "ok"])
}

eb.registerHandler('vertx.controller.user', customHandler) {
    log.info "Handler Registered For User Controller"
}

def register(Map userData, def eb) {
    eb.send("vertx.mongopersistor", ["action": "save", "collection": "todos", "document": userData])
}

