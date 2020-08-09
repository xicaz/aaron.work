---
layout: frontpage
cover: cover.gif
title: aaron.work
date:   2013-12-09 12:00:00
---

<div class="grid">
{% for post in site.posts %}
<div class="{{ post.gridclass }} grid-item">
    <a href="{{ post.url }}">
        <div class="card">
          {% if post.cardImage %}
            <div class="card-image">
              <figure class="image is-16by9">
                <img class="cover-image" src="{{post.cardImage}}" alt="image loading...">
              </figure>
            </div>
          {% endif %}
          <div class="card-content">
            <p class="title is-4"> {{post.title}} </p>
            {{post.excerpt}}
          </div>
        </div>
    </a>
</div>
{% endfor %}
</div>