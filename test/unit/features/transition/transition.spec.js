import Vue from 'vue'
import injectStyles from './inject-styles'
import { isIE9 } from 'web/util/index'
import { nextFrame } from 'web/runtime/modules/transition'

if (!isIE9) {
  describe('Transition system', () => {
    const duration = injectStyles()

    let el
    beforeEach(() => {
      el = document.createElement('div')
      document.body.appendChild(el)
    })

    it('basic transition', done => {
      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" transition>foo</div></div>',
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test v-leave v-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test v-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test v-enter v-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test v-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('named transition', done => {
      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" transition="test">foo</div></div>',
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave test-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter test-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('custom transition classes', done => {
      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" transition="test">foo</div></div>',
        data: { ok: true },
        transitions: {
          test: {
            enterClass: 'hello',
            enterActiveClass: 'hello-active',
            leaveClass: 'bye',
            leaveActiveClass: 'byebye active' // testing multi classes
          }
        }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test bye byebye active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test byebye active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test hello hello-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test hello-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('dynamic transition', done => {
      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" :transition="trans">foo</div></div>',
        data: {
          ok: true,
          trans: 'test'
        }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave test-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
        vm.trans = 'changed'
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test changed-enter changed-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test changed-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('inline transition object', done => {
      const enter = jasmine.createSpy('enter')
      const leave = jasmine.createSpy('leave')
      const vm = new Vue({
        template: `<div><div v-if="ok" class="test" :transition="{
          name: 'inline',
          enterClass: 'hello',
          enterActiveClass: 'hello-active',
          leaveClass: 'bye',
          leaveActiveClass: 'byebye active'
        }">foo</div></div>`,
        data: { ok: true },
        transitions: {
          inline: {
            enter,
            leave
          }
        }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test bye byebye active')
        expect(leave).toHaveBeenCalled()
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test byebye active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test hello hello-active')
        expect(enter).toHaveBeenCalled()
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test hello-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('transition with JavaScript hooks', done => {
      const onLeaveSpy = jasmine.createSpy('leave')
      const onEnterSpy = jasmine.createSpy('enter')
      const beforeLeaveSpy = jasmine.createSpy('beforeLeave')
      const beforeEnterSpy = jasmine.createSpy('beforeEnter')
      const afterLeaveSpy = jasmine.createSpy('afterLeave')
      const afterEnterSpy = jasmine.createSpy('afterEnter')

      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" transition="test">foo</div></div>',
        data: { ok: true },
        transitions: {
          test: {
            beforeLeave: (el, vm) => {
              expect(el).toBe(vm.$el.children[0])
              expect(el.className).toBe('test')
              beforeLeaveSpy(el, vm)
            },
            leave: (el, vm) => onLeaveSpy(el, vm),
            afterLeave: (el, vm) => afterLeaveSpy(el, vm),
            beforeEnter: (el, vm) => {
              expect(vm.$el.contains(el)).toBe(false)
              expect(el.className).toBe('test')
              beforeEnterSpy(el, vm)
            },
            enter: (el, vm) => onEnterSpy(el, vm),
            afterEnter: (el, vm) => afterEnterSpy(el, vm)
          }
        }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')

      let _el = vm.$el.children[0]
      vm.ok = false
      waitForUpdate(() => {
        expect(beforeLeaveSpy).toHaveBeenCalledWith(_el, vm)
        expect(onLeaveSpy).toHaveBeenCalledWith(_el, vm)
        expect(vm.$el.children[0].className).toBe('test test-leave test-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(afterLeaveSpy).not.toHaveBeenCalled()
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(afterLeaveSpy).toHaveBeenCalledWith(_el, vm)
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        _el = vm.$el.children[0]
        expect(beforeEnterSpy).toHaveBeenCalledWith(_el, vm)
        expect(onEnterSpy).toHaveBeenCalledWith(_el, vm)
        expect(vm.$el.children[0].className).toBe('test test-enter test-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(afterEnterSpy).not.toHaveBeenCalled()
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(afterEnterSpy).toHaveBeenCalledWith(_el, vm)
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('explicit user callback in JavaScript hooks', done => {
      let next
      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" transition="test">foo</div></div>',
        data: { ok: true },
        transitions: {
          test: {
            enter: (el, vm, cb) => {
              next = cb
            },
            leave: (el, vm, cb) => {
              next = cb
            }
          }
        }
      }).$mount(el)
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave test-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
        expect(next).toBeTruthy()
        next()
        expect(vm.$el.children.length).toBe(0)
      }).then(() => {
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter test-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
        expect(next).toBeTruthy()
        next()
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('css: false', done => {
      const enterSpy = jasmine.createSpy('enter')
      const leaveSpy = jasmine.createSpy('leave')
      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" transition="test">foo</div></div>',
        data: { ok: true },
        transitions: {
          test: {
            css: false,
            enter: enterSpy,
            leave: leaveSpy
          }
        }
      }).$mount(el)

      vm.ok = false
      waitForUpdate(() => {
        expect(leaveSpy).toHaveBeenCalled()
        expect(vm.$el.innerHTML).toBe('')
        vm.ok = true
      }).then(() => {
        expect(enterSpy).toHaveBeenCalled()
        expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      }).then(done)
    })

    it('no transition detected', done => {
      const enterSpy = jasmine.createSpy('enter')
      const leaveSpy = jasmine.createSpy('leave')
      const vm = new Vue({
        template: '<div><div v-if="ok" transition="nope">foo</div></div>',
        data: { ok: true },
        transitions: {
          nope: {
            enter: enterSpy,
            leave: leaveSpy
          }
        }
      }).$mount(el)

      vm.ok = false
      waitForUpdate(() => {
        expect(leaveSpy).toHaveBeenCalled()
        expect(vm.$el.innerHTML).toBe('<div class="nope-leave nope-leave-active">foo</div>')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe('')
        vm.ok = true
      }).then(() => {
        expect(enterSpy).toHaveBeenCalled()
        expect(vm.$el.innerHTML).toBe('<div class="nope-enter nope-enter-active">foo</div>')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toMatch(/<div( class="")?>foo<\/div>/)
      }).then(done)
    })

    it('enterCancelled', done => {
      const spy = jasmine.createSpy('enterCancelled')
      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" transition="test">foo</div></div>',
        data: { ok: false },
        transitions: {
          test: {
            enterCancelled: spy
          }
        }
      }).$mount(el)

      expect(vm.$el.innerHTML).toBe('')
      vm.ok = true
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter test-enter-active')
      }).thenWaitFor(duration / 2).then(() => {
        vm.ok = false
      }).then(() => {
        expect(spy).toHaveBeenCalled()
        expect(vm.$el.children[0].className).toBe('test test-leave test-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children.length).toBe(0)
      }).then(done)
    })

    it('transition with v-show', done => {
      const vm = new Vue({
        template: '<div><div v-show="ok" class="test" transition="test">foo</div></div>',
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.textContent).toBe('foo')
      expect(vm.$el.children[0].style.display).toBe('')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave test-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].style.display).toBe('none')
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].style.display).toBe('')
        expect(vm.$el.children[0].className).toBe('test test-enter test-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('leaveCancelled (v-show only)', done => {
      const spy = jasmine.createSpy('leaveCancelled')
      const vm = new Vue({
        template: '<div><div v-show="ok" class="test" transition="test">foo</div></div>',
        data: { ok: true },
        transitions: {
          test: {
            leaveCancelled: spy
          }
        }
      }).$mount(el)

      expect(vm.$el.children[0].style.display).toBe('')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave test-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(10).then(() => {
        vm.ok = true
      }).then(() => {
        expect(spy).toHaveBeenCalled()
        expect(vm.$el.children[0].className).toBe('test test-enter test-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].style.display).toBe('')
      }).then(done)
    })

    it('animations', done => {
      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" transition="test-anim">foo</div></div>',
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-anim-leave test-anim-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-anim-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-anim-enter test-anim-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-anim-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('transition on appear (inline)', done => {
      const vm = new Vue({
        template: `
          <div>
            <div v-if="ok"
              class="test"
              :transition="{
                name:'test',
                appear:true,
                appearClass: 'test-appear',
                appearActiveClass: 'test-appear-active'
              }">foo</div>
          </div>
        `,
        data: { ok: true }
      }).$mount(el)

      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-appear test-appear-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-appear-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('transition on appear (resolved)', done => {
      const vm = new Vue({
        template: `
          <div>
            <div v-if="ok"
              class="test"
              transition="test">foo</div>
          </div>
        `,
        data: { ok: true },
        transitions: {
          test: {
            appear: true,
            appearClass: 'test-appear',
            appearActiveClass: 'test-appear-active'
          }
        }
      }).$mount(el)

      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-appear test-appear-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-appear-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('transition on appear with v-show', done => {
      const vm = new Vue({
        template: `
          <div>
            <div v-show="ok"
              class="test"
              :transition="{name:'test',appear:true}">foo</div>
          </div>
        `,
        data: { ok: true }
      }).$mount(el)

      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter test-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('transition on SVG elements', done => {
      const vm = new Vue({
        template: '<svg><circle cx="0" cy="0" r="10" v-if="ok" class="test" transition></circle></svg>',
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.childNodes[0].getAttribute('class')).toBe('test')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.childNodes[0].getAttribute('class')).toBe('test v-leave v-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.childNodes[0].getAttribute('class')).toBe('test v-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.childNodes.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.childNodes[0].getAttribute('class')).toBe('test v-enter v-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.childNodes[0].getAttribute('class')).toBe('test v-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.childNodes[0].getAttribute('class')).toBe('test')
      }).then(done)
    })

    it('transition on child components', done => {
      const vm = new Vue({
        template: '<div><test v-if="ok" class="test" transition></test></div>',
        data: { ok: true },
        components: {
          test: {
            template: '<div transition="test">foo</div>' // test transition override from parent
          }
        }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test v-leave v-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test v-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test v-enter v-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test v-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })
  })
}
