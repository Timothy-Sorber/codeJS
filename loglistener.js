const consoleDiv = document.getElementById('console');
let isAtBottom = true;

// Function to check if scroll is at the bottom
function checkScroll() {
		isAtBottom = consoleDiv.scrollHeight - consoleDiv.clientHeight <= consoleDiv.scrollTop + 1;
}

// Initial check
checkScroll();

// Observer to detect new elements added to the console
const observer = new MutationObserver(() => {
		// If scroll is already at the bottom, scroll down slowly
		if (isAtBottom) {
				consoleDiv.scrollTop = consoleDiv.scrollHeight;
		}
});

observer.observe(consoleDiv, { childList: true });

// Check scroll position on scroll events
consoleDiv.addEventListener('scroll', () => {
		checkScroll();
});