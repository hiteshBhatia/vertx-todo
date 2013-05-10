/*
 * Copyright 2011-2012 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.intelligrape.vertx.todo

def eb = vertx.eventBus

def pa = 'vertx.mongopersistor'

def todos = [
        [
                "id": 0,
                "username": "hitesh",
                "email": "hitesh@intelligrape.com",
                "password": "igdefault",
                "todo": [
                        ["id": 0, "task": "task 11"],
                        ["id": 1, "task": "task 12"],
                        ["id": 2, "task": "task 13"],
                ]
        ]
]

// First delete everything

eb.send(pa, ['action': 'delete', 'collection': 'todos', 'matcher': [:]])

//eb.send(pa, ['action': 'delete', 'collection': 'users', 'matcher': [:]])

// Insert albums - in real life price would probably be stored in a different collection, but, hey, this is a demo.

for (todo in todos) {
    eb.send(pa, [
            'action': 'save',
            'collection': 'todos',
            'document': todo
    ])
}