(function() {

function initThen(next) {
	isMyOwnWork(function(isMine) {
		getLengthThreshold(function(threshold) {
			next(isMine, threshold);
		});
	});
}

function isMyOwnWork(next) {
	chrome.storage.sync.get('username', function(o) {
		var handle = o.username,
			title = document.getElementById("screenshot-title-section"),
			url = title.querySelector("a.url").href, // "[dribbble]/username"
			username = url.split('/').pop(); // "username"
		next(handle === username);
	});
}

function getLengthThreshold(next) {
	chrome.storage.sync.get('length', function(o) {
		next(Number(o.length) || 70);
	});
}

function isResponse(threshold, node) {
	var text = commentText(node);
	return isByOwner(node) || isUsefulText(text, threshold);
}

function isByOwner(node) {
	return array(node.classList).indexOf("owner") !== -1;
}

function isUsefulText(text, threshold) {
	return text.length >= threshold;
}

function commentText(node) {
	var commentBody = node.querySelector(".comment-body");
	return commentBody.textContent.trim();
}

function array(list) {
	return Array.prototype.slice.call(list, 0);
}

initThen(function(isMyOwn, lengthThreshold) {
	if(isMyOwn) return;

	var useful = isResponse.bind(null, lengthThreshold),
		list = document.getElementById("comments"),
		comments = array(list.childNodes).filter(function(node) {
			return node.nodeName === "LI";
		});

	comments.forEach(function(comment) {
		if(isMyOwn || useful(comment)) return;
		comment.style.display = "none";
	});

	// Add a show all button
	var commentHeader = document.getElementById("comments-section"),
		commentCount = commentHeader.querySelector("h2");

	commentCount.innerHTML += "<a id='comments-show-all'>(Show all comments)</a>";

	var commentShowBtn = document.getElementById("comments-show-all");

	commentShowBtn.onclick = function() {
		array(document.getElementById("comments").childNodes)
			.filter(function(node) {
				return node.nodeName === "LI";
			})
			.forEach(function(comment) {
				comment.style.display = 'block';
			});
		commentShowBtn.innerHTML = '';
	}

});

}).call(this);