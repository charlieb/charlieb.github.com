---
layout: default
title: The Airlock, a Thought Experiment
excerpt_separator: <!--more-->
---

The Airlock, a Thought Experiment
=================================

The ship that I'm intending to saddle the player with initially is going to be pretty basic. One of the features it will be lacking is an airlock. Pretty soon the player probably will probably want to construct one. It might even turn out the be the tutorial. As you can tell this is some long term theoretical planning. I think it's still useful to chase down these thoughts, if only for the fun of the mental exercise. As you'll see, they can reveal things that I might not have otherwise thought about until much later.

### The Airlock and the Agent

Imagine, if you will, an agent. This agent gets a task that says "go outside and mine this square". This agent is inside the ship and they'll have to navigate an airlock to get outside. The pathing subsystem will have to somehow work the airlock without letting the air out. Here's how I imagine that goes:

* Move to the inner door
* Do the open action to the inner door
* Move through the inner door
* Do the close action the inner door
* Do the activate action to the pump to remove the air
* Wait for the pump to finish
* Move to the outer door
* Do the open action to the outer door
* Move through the outer door
* Do the close action the outer door

Walking and working the doors is a necessary behaviour to have in the agents' repertoire. The problem is how the agent knows that they have to perform the pumpdown sequence? What if the airlock is in use? And how is an agent outside the airlock supposed to know the pressure state inside the airlock. The agent just got much more complicated to implement. This would also require the player to mark the area as "airlock" so the agent AI knows what set of behaviours it's supposed to employ. That sounds like a lot of hard and exacting work and that's just one behaviour.

### Emergence

I am far too lazy to write and debug a large set of complex agent behaviours. But how can I get out of it? It goes against the philosophy of the game (good one!). One of the core concepts of this type of game is emergence. The idea is that when a bunch of simple systems interact they can exhibit complex behaviours. Think ants building temperature and humidity regulating fungus gardens or the freezing water molecules giving rise to the uniqueness of snowflakes. Or more relevant to the topic at hand, the amazing, deep and complex stories that dwarf fortress generates.

I don't need complex behaviours for complexity to emergence. I think complex behaviours would actually get in the way of emergence because they force all interactions of a given type (e.g. agent/airlock) to always go down in the same way.

So that's my excuse for not implementing a large number of complicated behaviours in the agents that will populate my game. Did you buy it?

### But What About the Airlock?

So after all that silly nonsense about snowflakes and ant horticulture there's still no airlock. How to preserve the simplicity of the simulation and still keep the air mostly on the inside? In real airlocks you can't just open both doors at the same time. There are safety systems that prevent that. Likewise you can't open the outer door in a pressurized lock or the inner door in a depressurized lock.

If the airlock does the work instead of the agent the amount of work didn't change. The complexity just moved from one system to another. The size of my headache stayed the same. That's not good. I need to be more creative if I'm going to get really lazy about this.

### A New Gameplay System is Born

The solution I came up with is to allow the items (doors, pumps etc.) to talk to and constrain each other. Here are the rules for the airlock

* Inner Door only opens when
   * Outer door is closed (actually you don't need this rule!)
   * Pump equalized pressure with the ship
* Pump only activates pumpdown when 
   * Inner door is closed
   * Outer door is closed
* Pump only equalizes pressure when
   * Outer door is closed
   * Inner door is closed
* Outer door only opens when
   * Inner door is closed
   * Pump is in pumpdown state
   
Imagine an agent walking up to such a system and trying to use it like a normal door.

* Agent does open action to the inner door, then waits for it to open or fail
* The inner door queries the state of the outer door and fails if it's open
* The inner door asks the pump to equalize pressure with the ship and waits
* The pump checks both doors are closed
* The pump equalizes pressure (now back up the stack we go!)
* The pump signals the door that it's finished successfully
* The door opens and signals the agent that it's finished successfully

If the pump can't equalize pressure because the outer door is open it will fail and that failure will get passed back up to the door and then the agent. There's a state transition diagram in here somewhere.

I think there's a lot more potential for interesting things to happen with this kind of system than if I had pre-programmed it. For example there may be times in the course of an unfolding disaster when you actually do want both doors open at the same time. This system can manage that (with a little hacking, left as an exercise to the reader).

Instead of one or two large, complicated systems with a few pre-programmed interactions; we now have many small, simple systems that can be combined in an enormous variety of ways. As a bonus, once the signaling system is built, coding up more items is fairly simple.

My challenge then is to make setting up these rules and interactions easy and logical for the player. Intuitive well designed UI's are not my strong suit. But hey people play dwarf fortress, how much worse can I make the UI than that and imitation _is_ the sincerest form of flattery.
