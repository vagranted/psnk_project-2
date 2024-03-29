let eventBus = new Vue()

Vue.component('cols', {
    props: {
        check: {
            type: Boolean,
        }
    },
    template: `
    <div id="cols" v-if="isComponentActive">
    <div class="col-wrapper">
    <h2 class="error" v-for="error in errors">{{error}}</h2>
        <newcard></newcard>
        <div class="cols-wrapper ">
            <div class="col" :class="{ 'col-red': gabellaRed }">
                <ul>
                    <li class="cards" v-for="card in column1"><p class="p-title">{{ card.title }}</p>
                        <ul>
                            <li class="tasks" v-for="(t, index) in card.subtasks" :key="index" v-if="t.title != null">
                               
                                <input  @click="newStatus1(card, t)" class="checkbox" 
                                type="checkbox" :disabled="t.completed || gabellaRed" :checked="t.completed">
                                <p>{{t.title}}</p>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div class="col">
                <ul>
                    <li class="cards" v-for="card in column2"><p class="p-title">{{ card.title }}</p>
                        <ul>
                            <li class="tasks" v-for="t in card.subtasks" v-if="t.title != null">
                                <input @click="newStatus2(card, t)"
                                class="checkbox" type="checkbox" 
                                :disabled="t.completed" :checked="t.completed">
                                <p  >{{t.title}}</p>
                            </li>
                        </ul>
                    </li>
                   
                </ul>
            </div>
            <div class="col">
                <ul>
                    <li class="cards" v-for="card in column3"><p class="p-title">{{ card.title }}</p><div class="flex-revers"><p>{{ card.date }}</p>
                    <ul>
                            <li class="tasks" v-for="t in card.subtasks" v-if="t.title != null">
                                <input checked
                                class="checkbox" type="checkbox" 
                                :disabled="t.completed">
                                <p>{{t.title}}</p>
                                
                            </li>
                        </ul>
                    </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    </div>
    `,
    data() {
        return {
            column1: [],
            column2: [],
            column3: [],
            errors: [],
            isDisabled: false,
            gabellaRed: false,
            isComponentActive: true,
        }
    },
    mounted() {
        this.column1 = JSON.parse(localStorage.getItem('column1')) || [];
        this.column2 = JSON.parse(localStorage.getItem('column2')) || [];
        this.column3 = JSON.parse(localStorage.getItem('column3')) || [];
        eventBus.$on('card-submitted', card => {
            this.errors = []
            if (this.column1.length < 3) {
                this.column1.push(card)
                this.saveColumn1();
            } else {
                this.errors.push("Нельзя добавить больше 3 записей.")
            }
        })
    },
    methods: {
        newStatus1(card, t) {
            console.log(this.gabellaRed)
            console.log(`${card.title}`, t)

            t.completed = !t.completed
            let count = 0

            card.status = 0
            this.errors = []

            for (let i = 0; i < 5; ++i) {
                if (card.subtasks[i].title != null) {
                    count++;
                }
            }
            for (let i = 0; i < count; ++i) {
                if (card.subtasks[i].completed === true) {
                    card.status++
                }
            }
            if (card.status / count * 100 === 100) {
                this.gabellaRed = false
                this.column3.push(card)
                this.column1.splice(this.column1.indexOf(card), 1)
                card.date = new Date()
                this.reloadComponent()
            } else if (card.status / count * 100 >= 50 && this.column2.length < 5) {
                this.column2.push(card)
                this.column1.splice(this.column1.indexOf(card), 1)
                if (this.column2.length === 5) {
                    this.isDisabled = true
                }
                this.reloadComponent()
            } else if (this.column2.length === 5) {
                if (card.status / count * 100 >= 50) {
                    this.gabellaRed = true
                }
                this.errors.push("Вам нужно заполнить карту во втором столбце, чтобы добавить новую карту в первый столбец.")
            }

            for (let c of this.column1) {
                console.log('pp', c)
                for (let punk of c.subtasks) {
                    console.log('wwwwwww', punk.title)
                    console.log('wwwwwww', punk.completed)
                    if (!punk.completed) {
                        punk.completed = false
                    }
                }
            }
            this.isChecked()

        },

        updateCheckboxStatus(card) {
            card.subtasks.forEach(t => {
                if (!t.completed) { // Проверяем, не заблокирован ли чекбокс
                    t.completed = false; // Снимаем отметку с чекбокса
                }
            });
        },

        reloadComponent() {
            this.isComponentActive = false;

            function gg() {
                return 0
            }

            setTimeout(gg, 1000)
            this.$nextTick(() => {
                this.isComponentActive = true;
            });
        },

        newStatus2(card, t) {
            t.completed = true
            let count = 0
            card.status = 0


            for (let i = 0; i < 5; i++) {
                if (card.subtasks[i].title != null) {
                    count++
                }
            }

            for (let i = 0; i < count; i++) {
                if (card.subtasks[i].completed === true) {
                    card.status++
                }
            }
            if (card.status / count * 100 === 100) {
                this.gabellaRed = false
                this.column3.push(card)
                this.column2.splice(this.column2.indexOf(card), 1)
                card.date = new Date()
            }

        }
    },
    computed: {
        isChecked() {
            return !this.t.completed && !this.gabellaRed;
        }
    },
    props: {
        card: {
            title: {
                type: Text,
                required: true
            },
            subtasks: {
                type: Array,
                required: true,
                completed: {
                    type: Boolean,
                    required: true
                }
            },
            date: {
                type: Date,
                required: false
            },
            status: {
                type: Number,
                required: true
            },
            errors: {
                type: Array,
                required: false
            },

        },
    },

})

Vue.component('newcard', {
    template: `
    <form class="addform" @submit.prevent="onSubmit">
        <p>
            <label for="title">Название</label>
            <input id="title" required v-model="title" type="text" placeholder="Название">
        </p>
            <input required id="subtask1" v-model="subtask1" placeholder="Задача 1">
            <input required id="subtask2" v-model="subtask2" maxlength="30" placeholder="Задача 2">
            <input required id="subtask3" v-model="subtask3" maxlength="30" placeholder="Задача 3">
            <input id="subtask4" v-model="subtask4" maxlength="30" placeholder="Задача 4">
            <input id="subtask5" v-model="subtask5" maxlength="30" placeholder="Задача 5">
            <button type="submit">Добавить карточку</button>
    </form>
    `,
    data() {
        return {
            title: null,
            subtask1: null,
            subtask2: null,
            subtask3: null,
            subtask4: null,
            subtask5: null,
            errors: [],
        }
    },
    methods: {
        onSubmit() {
            let card = {
                title: this.title,
                subtasks: [{title: this.subtask1, completed: false},
                    {title: this.subtask2, completed: false},
                    {title: this.subtask3, completed: false},
                    {title: this.subtask4, completed: false},
                    {title: this.subtask5, completed: false}],
                date: null,
                status: 0
            }
            eventBus.$emit('card-submitted', card)
            this.title = null
            this.subtask1 = null
            this.subtask2 = null
            this.subtask3 = null
            this.subtask4 = null
            this.subtask5 = null
        }
    }
})

let app = new Vue({
    el: '#app',
    data: {
        name: 'Notes'
    }
})
