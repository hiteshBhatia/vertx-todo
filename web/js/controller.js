angular.module('myApp', ['ngCookies']);

var eb = new vertx.EventBus(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/eventbus');

console.log(eb);

var loggedOutTemplates = {"navigation": 'templates/signin.html', "display": 'templates/signup.html'};
var loggedInTemplates = {"navigation": 'templates/logout.html', "display": 'templates/todolist.html'};
var cookieNames = ["sessionID", "username"];


function GeneralController($scope, $cookieStore) {
    $scope.master = {};
    $scope.details = $scope.details || {};
    $scope.details.template = loggedOutTemplates;
    $scope.todos = {};


    if (isLoggedIn()) {
        $scope.details.username = $cookieStore.get('username')
        $scope.details.template = loggedInTemplates;
    }


    $scope.login = function (loginCredentials) {
        loginUserAndUpdateTemplates(loginCredentials)
    }


    $scope.logout = function () {
        clearCookies();
    }

    $scope.register = function (user) {
        registerAndLoginUser(user)
    };

    $scope.isUnchanged = function (user) {
        return angular.equals(user, $scope.master);
    };

    $scope.delete = function (task) {
        deleteTask(task)
    };

    $scope.add = function (newTask) {
        addTask(newTask, getUsername())
    };
    $scope.update = function (task) {
        console.log(task)
    };

    function addTask(taskName, username) {
        var length = 1;
        var existing;

        eb.send('vertx.mongopersistor', {action: 'find', collection: 'todos', matcher: {"username": username}},
            function (reply) {
                existing = reply.results[0].todo ? reply.results[0].todo.length : 0;
                var finalLength = existing + 1;
                eb.send('vertx.mongopersistor', {action: 'update', collection: 'todos', criteria: {username: username},
                    objNew: { $push: { todo: { "id": finalLength, "task": taskName }}}
                }, function (replied) {
                    console.log(replied)
                    findTodos()
                });
            });
    }

    function registerAndLoginUser(userData) {
        userData.action = "register"
        eb.send("vertx.controller.user", userData, function (reply) {
            loginUserAndUpdateTemplates(userData)
        });
    }

    function loginUserAndUpdateTemplates(loginCredentials) {
        if (!isLoggedIn()) {
            performLoginAndOtherActions(loginCredentials);
        }
    }

    function isLoggedIn() {
        return $cookieStore.get("sessionID")
    }

    function getUsername() {
        return $cookieStore.get("username")

    }

    function performLoginAndOtherActions(loginCredentials) {
        eb.send("vertx.basicauthmanager.login", loginCredentials, function (reply) {
            var sessionData = {"sessionID": reply.sessionID, "username": loginCredentials.username}
            $scope.details.username = loginCredentials.username
            updateCookiesAndTemplates(sessionData)
            findTodos()

        });
    }

    function updateCookiesAndTemplates(sessionData) {
        updateCookies(sessionData);
        updateTemplates(loggedInTemplates)
    }

    function updateCookies(sessionData) {
        for (cookie in cookieNames) {
            var cookieName = cookieNames[cookie];
            var cookieValue = sessionData[cookieName];
            $cookieStore.put(cookieName, cookieValue)
        }
    }

    function updateTemplates(templates) {
        $scope.details.template = templates
        $scope.$apply($scope.details.template)
    }

    function clearCookies() {
        for (cookie in cookieNames) {
            $cookieStore.remove(cookieNames[cookie]);
        }
        $scope.details.template = loggedOutTemplates;
    }

    function findTodos() {
        eb.send('vertx.mongopersistor', {
                action: 'find',
                collection: 'todos',
                matcher: {"username": getUsername()},
                sort: {
                    "todo": -1
                }
            },
            function (reply) {

                $scope.$apply(
                    $scope.todos = reply.results[0].todo
                );
            });
    }

    function deleteTask(task) {
        var username = getUsername();
        eb.send('vertx.mongopersistor', {action: 'update', collection: 'todos', criteria: {username: username},
            objNew: { $pull: {"todo": {'id': task.id} }}
        }, function (reply) {
            findTodos()
            console.log(reply)
        });
    }

    eb.onopen = function () {
        if (isLoggedIn()) {
            findTodos()
        }
    };

}
