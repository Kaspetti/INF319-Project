# INF319-Project

## Goal
Visualizing networks is a difficult task which gets even more complicated once we start talking about **dynamic networks**. Dynamic networks are networks that change over time, and visualizing this in a good way provides many challenges. S. van den Elzen et al. write in [this](https://www.doi.org/10.1109/TVCG.2015.2468078) paper about some tasks to solve when visualizing dynamic networks and how to solve them. These tasks include:
* Identification
    * Stable states
    * Recurring states
    * Outlier states
* Transitions
* General evolution

The goal of this project will be to implement the methods proposed in this paper on meteorology data, specifically MTA data (Moisture Transport Axes). This data is in a form of lines and develop over time. By creating networks of these lines on separate time steps we can use the method above to learn about the evolution of the lines as time progress.
