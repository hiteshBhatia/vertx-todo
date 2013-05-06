//def eventBus = vertx.eventBus
//
//def customHandler = { data ->
//    login(eventBus,data.body)
//}
//
//eventBus.registerHandler('ig.simple-session-manager', customHandler) {
//    println "Handler Registered Simple Session Manager"
//}
//
//def login(def eb,Map loginCredentials){
//    println "Inside Login"
//    eb.send("vertx.basicauthmanager.login", loginCredentials){ reply ->
//        if(reply.body.status=="ok"){
//            eb.send("application.todo.sessionManager",){ reply ->
//        }
//    }
//}
//
//def createCookie(def eb,String username,String sessionID){
////    Map sessionInfo= [username:username,sessionID:sessionID]
////    eb.send("vertx.mongopersistor", ["action": "save", "collection": "todos", "document": sessionInfo])
//}
//
//def loggedInInfo(){
//    return "username"
//}
//
//def logout(String username){
//    destroyCookie(username)
//}
//
//def destroyCookie(String username) {
//
//}