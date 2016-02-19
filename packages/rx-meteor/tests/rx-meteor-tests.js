var Rx = Npm.require("rx")
var Fiber = Npm.require('fibers');

var Future;
if (Meteor.isServer)
  Future = Npm.require('fibers/future');

var identity = (a) => a;

var queue = function(f){
	var disposed = false;
	if(process && process.nextTick) {
		debugger;
		process.nextTick(() => !disposed && f());
		return () => (disposed = true);
	} else {
		debugger;
		var disposable = setTimeout(f);
		return () => clearTimeout(disposable);
	}
}

var scheduler = new Rx.TestScheduler();
var withTimeout = (delay) => (action) => {
	console.log('scheduling', action)
	var disposable = queue(action);
	return Rx.Disposable.Create(() => disposable())
}
var timeoutScheduler = new Rx.Scheduler(
	() => {
		console.log("Scheduler date")
		return new Date 
	},
	(state, action) => {
		console.log("Action 1")
		return withTimeout(10, () => action(timeoutScheduler, state))
	},
	(state, delay, action) => {	
		console.log("Action 2")
		return withTimeout(delay, () => action(timeoutScheduler, state))
	},
	() => {
		console.log("Action 3")
	}
);

Tinytest.add('RxJS should be available in scope', function (test) {
	test.notEqual(typeof Rx, 'undefined')
  test.equal(true, true)
})

Tinytest.add('RxJS should be usable with immediate schedulers', function (test) {
	var counter = 0,
			completed = false
	Rx.Observable
		.from([1,2,3,4,5])
		.subscribe(
			(i) => { 
				test.equal(++counter, i)
			}, 
			e => {}, 
			() => {
				completed = true
			})
	test.equal(counter, 5)
	test.equal(completed, true)
})

Tinytest.add('RxJS should be usable with test schedulers', function (test) {
	var counter = 0,
			completed = false
	Rx.Observable
		.from([1,2,3,4,5], identity, scheduler)
		.subscribe(
			(i) => { 
				test.equal(++counter, i)
			}, 
			e => {}, 
			() => {
				completed = true
			})
	test.equal(counter, 5)
	test.equal(completed, true)
})

Tinytest.addAsync('RxJS should be usable with meteor schedulers', function (test, next) {
	var counter = 0,
			completed = false

	test.notEqual(typeof Rx.Scheduler.meteor, 'undefined');
	if(!Rx.Scheduler.isScheduler(Rx.Scheduler.meteor)) {
		test.fail("MeteorScheduler is no scheduler");
		return next();
	}

	Rx.Observable
		.fromArray([1,2,3,4,5], Rx.Scheduler.meteor)
		.subscribe(
			(i) => test.equal(++counter, i),
			e => {}, 
			() => (completed = true))

	test.equal(counter, 5)
	test.equal(completed, true)
	next()
})

function checkFiber(test) {
	if(!Fiber.current) {
		test.fail("Not on Meteor fiber");
	}
}

Tinytest.addAsync('RxJS should be usable with async schedulers', function (test, next) {
	var counter = 0,
			completed = false

	test.notEqual(typeof Rx.Scheduler.meteorAsync, 'undefined');
	if(!Rx.Scheduler.isScheduler(Rx.Scheduler.meteorAsync)) {
		test.fail("MeteorScheduler is no scheduler");
		return next();
	}

	Rx.Observable
		.fromArray([1,2,3,4,5], Rx.Scheduler.meteorAsync)
		.subscribe(
			(i) => (
			 	checkFiber(test),
			  test.equal(++counter, i),
				true
			),
			e => {},
			() => 
				(completed = true), 
				next()
			)

	test.equal(counter, 0)
	test.equal(completed, false)
})