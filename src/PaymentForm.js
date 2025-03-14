// client/src/PaymentForm.js

import React, { useState, useEffect, useRef } from 'react';

const PaymentForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const brickControllerRef = useRef(null);

    // Initialize and render Card Payment Brick
    useEffect(() => {
        // Track if component is mounted
        let isMounted = true;
        
        // Cleanup previous brick if it exists
        if (brickControllerRef.current) {
            brickControllerRef.current.unmount();
            brickControllerRef.current = null;
        }

        // Load Mercado Pago SDK
        const script = document.createElement('script');
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.type = "text/javascript";
        document.body.appendChild(script);

        script.onload = async () => {
            if (!isMounted) return;
            
            try {
                const mp = new window.MercadoPago('TEST-60962483-975c-46c0-9ae6-8550c3e42753', {
                    locale: 'en' // Set locale to English
                });

                const bricksBuilder = mp.bricks();
                
                // Your specified callbacks
                const initialization = {
                    amount: 100,
                };

                const onSubmit = async (formData) => {
                    // callback llamado al hacer clic en el botón enviar datos
                    return new Promise((resolve, reject) => {
                        fetch('http://localhost:4000/process-payment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(formData),
                        })
                            .then((response) => response.json())
                            .then((response) => {
                                // recibir el resultado del pago
                                console.log("Payment processed:", response);
                                alert("Payment processed successfully!");
                                resolve();
                            })
                            .catch((error) => {
                                // manejar la respuesta de error al intentar crear el pago
                                console.error('Error processing payment:', error);
                                alert("Payment failed. Please try again.");
                                reject();
                            });
                    });
                };

                const onError = async (error) => {
                    // callback llamado para todos los casos de error de Brick
                    console.log(error);
                };

                const onReady = async () => {
                    /*
                      Callback llamado cuando Brick está listo.
                      Aquí puedes ocultar cargamentos de su sitio, por ejemplo.
                    */
                    console.log('Brick ready');
                    if (isMounted) {
                        setIsLoading(false);
                    }
                };
                
                const settings = {
                    initialization: initialization,
                    callbacks: {
                        onReady: onReady,
                        onSubmit: onSubmit,
                        onError: onError
                    },
                    customization: {
                        visual: {
                            style: {
                                theme: 'default'
                            }
                        },
                        paymentMethods: {
                            maxInstallments: 24
                        }
                    }
                };
                
                // Create and store the brick controller
                if (isMounted) {
                    setIsLoading(true);
                    brickControllerRef.current = await bricksBuilder.create(
                        'cardPayment', 
                        'cardPaymentBrick_container', 
                        settings
                    );
                }
            } catch (error) {
                console.error('Error initializing Mercado Pago:', error);
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        return () => {
            isMounted = false;
            // Cleanup script and brick
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
            if (brickControllerRef.current) {
                brickControllerRef.current.unmount();
                brickControllerRef.current = null;
            }
        };
    }, []);

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            
            
            {isLoading && (
                <div className="flex justify-center items-center mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}
            
            {/* Card Payment Brick will be rendered in this container */}
            <div id="cardPaymentBrick_container" className="mb-4"></div>

        </div>
    );
};

export default PaymentForm;