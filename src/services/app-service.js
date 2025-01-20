const handleJob = async (msg) => {
    // http request based on the message body;
    const {
        url, method, headers, body,
    } = msg;

    // http request based on the message body;
    try {
        const response = await fetch(url, {
            method,
            // headers,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify(body),
        });

        console.log('response', response);
    } catch (error) {
        console.error('error', error);
    }
};

export default { handleJob };
