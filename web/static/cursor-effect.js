document.addEventListener('DOMContentLoaded', function() {
    const coords = { x: 0, y: 0 };  // cursor position
    const circles = document.querySelectorAll(".circle");
    
    const colorGradient = [
        "#008440", "#00844d", "#008459", "#008464", 
        "#00836e", "#008277", "#00817f", "#008086",
        "#007e8b", "#007c8f", "#007a92", "#007893"
    ]

    const colorConfetti = [
        "#fe7f7f", "#ffbe86", "#6efe86", "#007893",
        "#008440", "#9bebfd", "#a1fece", "#fff"
    ]
    
    circles.forEach(function (circle, index) {
        circle.x = 0;
        circle.y = 0;
        circle.style.backgroundColor = colorGradient[index % colorGradient.length];
    });
    
    window.addEventListener("mousemove", function(e){
        coords.x = e.clientX;
        coords.y = e.clientY;
        animateCircles();
    });

    window.addEventListener("click", function(e){
        animateConfetti();
    });
    
    function animateCircles() {
        let x = coords.x;
        let y = coords.y;
    
        circles.forEach(function (circle, index) {
            circle.style.left = `${x - circle.style.width / 2}px`;
            circle.style.top = `${y - circle.style.height / 2}px`;

            circle.style.scale = `${(circles.length - index) / circles.length}`;
            
            circle.x = x;
            circle.y = y;

            const nextCircle = circles[index + 1] || circles[0];
            x += (nextCircle.x - x) * 0.6;
            y += (nextCircle.y - y) * 0.6;
        });
    }

    function animateConfetti() {
        let counter = Math.floor((Math.random() * 0.5 + 0.5) * 10);
        while (counter > 0) {
            addConfetti();
            counter--;
        };
    }

    function addConfetti() {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = `${coords.x + (Math.random() - 0.5) * 100}px`;
        confetti.style.top = `${coords.y + (Math.random() - 0.5) * 100}px`;
        confetti.style.backgroundColor = colorConfetti[Math.floor(Math.random() * colorConfetti.length)];
        confetti.style.transform = `scale(0)`; // Initial scale set to 0
        confetti.style.opacity = 0;
        confetti.style.transition = "opacity 1s ease, transform 1s ease"; // Add transition for opacity and transform
        document.body.appendChild(confetti);
        void confetti.offsetWidth; // Trigger reflow, ensure the transition starts
        confetti.style.opacity = 1; // Fade in the element
        confetti.style.transform = `scale(${Math.random() * 2})`; // Scale the element to a random value between 0 and 2
        // Delay setting opacity to 0 by a short time
        setTimeout(() => {
            confetti.style.opacity = 0; // Fade out the element
            // Remove the element 1 second after fading out
            setTimeout(() => {
                confetti.parentNode.removeChild(confetti);
            }, 1000);
        }, 500); // 500ms delay before fading out
    }
    
    requestAnimationFrame(animateCircles);
    
    setInterval(animateCircles, 30);
    setInterval(animateConfetti, 2000);
})

