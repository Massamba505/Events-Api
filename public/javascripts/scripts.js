async function tryEndpoint(endpoint) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* Add your request body here */ })
    };

    try {
        const response = await fetch(endpoint, requestOptions);
        const data = await response.json();
        console.log('Response:', data);
        alert('Response: ' + JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}
