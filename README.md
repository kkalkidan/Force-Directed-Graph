# Force-Directed-Graph

  Implements a force-directed graph to describe the network of character co-occurrence in Les Misérables.The data is well-structured in a node-link format. Each node represent a character, and is assigned to different group.
 The co-occurrence of characters is represented in links, with the value of each link representing the times of co-occurrence.
 
  Uses the Fruchterman-Reingold layout algorithm. For more details of the algorithm, please refer to: http://onlinelibrary.wiley.com/doi/10.1002/spe.4380211102/epdf
  
  This code doesn't call the force simulation method wrapped in D3.
  
 ##  Implementations
      1. A static, well-arranged node-link graph with correct visual encoding 
      2.  Dynamically load the graph to reveal the tuning process from the initial status to a stable result.
      3.  Enable dragging on nodes, and dynamically re-arrange the graph when drag stops
 
 ![alt text](https://github.com/kkalkidan/Force-Directed-Graph/blob/master/view.png)
