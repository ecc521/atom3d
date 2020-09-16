
self.addEventListener('fetch', function(event) {
	let promise = fetch(event.request)
	let cacheLoader = caches.open('atombohrmodels3d')
	promise.then((response) => {
		let resp2 = response.clone()
		cacheLoader.then((cache) => {
			console.log("Writing into cache " + event.request.url)
			cache.put(event.request, resp2);
		})
		return response
	})
	promise.catch((response) => {
		console.log("Using cache as fallback for " + event.request.url)
		return caches.match(event.request)
	})

  event.respondWith(promise);
});
