var root = Npm.require("rx"),
		Scheduler = root.Scheduler,
		inherits = root.internals.inherits,
		Disposable = root.Disposable,
		BinaryDisposable = root.BinaryDisposable,
		SingleAssignmentDisposable = root.SingleAssignmentDisposable,
		Rx = root;

if (Meteor && Meteor.bindEnvironment) {
	console.log("Meteor environment!");
} else {
	// runInMeteor = function(cb) { root.setTimeout(cb, 1000 / 60); };
	// cancelAnimFrame = root.clearTimeout;
}

function runInMeteor(action) {
	return action();
}

function cancelInMeteor(id) {
	// No impl
}

/**
 * Gets a scheduler that schedules schedules 
 * work in a fiber with bound Meteor environment.
 */
Scheduler.meteor = (function () {
	var MeteorScheduler = (function (__super__) {
		inherits(MeteorScheduler, __super__);
		function MeteorScheduler() {
			__super__.call(this);
		}
		
		function scheduleAction(disposable, action, scheduler, state) {
			return function schedule() {
				!disposable.isDisposed && disposable.setDisposable(Disposable._fixup(action(scheduler, state)));
			};
		}

		function ClearDisposable(method, id) {
			this._id = id;
			this._method = method;
			this.isDisposed = false;
		}

		ClearDisposable.prototype.dispose = function () {
			if (!this.isDisposed) {
				this.isDisposed = true;
				this._method.call(null, this._id);
			}
		};

		MeteorScheduler.prototype.schedule = function (state, action) {
			console.log("MeteorScheduler#Schedule");
			var disposable = new SingleAssignmentDisposable(),
					id = runInMeteor(scheduleAction(disposable, action, this, state));
			return new BinaryDisposable(disposable, new ClearDisposable(cancelInMeteor, id));
		};

		MeteorScheduler.prototype._scheduleFuture = function (state, dueTime, action) {
			console.log("MeteorScheduler#ScheduleFuture");
			if (dueTime === 0) { return this.schedule(state, action); }
			var disposable = new SingleAssignmentDisposable(),
					id = root.setTimeout(scheduleAction(disposable, action, this, state), dueTime);
			return new BinaryDisposable(disposable, new ClearDisposable(root.clearTimeout, id));
		};

		return MeteorScheduler;
	}(Scheduler));

	return new MeteorScheduler();
}());