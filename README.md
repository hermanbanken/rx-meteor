# RxMeteor

This Meteor packages provides bindings for Meteor so you can use
Rx with Meteor. This integration is less than trivial because Meteor
uses Fibers extensively on the server-side. With this package we 
can create more complex Reactive Programming data flows, 
and are not limited to just Promises and Futures.

The package provides both Schedulers which work with fibers,
and easy to use bindings to Tracker's reactive values and dependencies.
You can publish an Observable as a Tracker dependency, or use a Tracker
dependable as input to an Observable.

If you like this package and put it to use, let me know @hermanbanken.