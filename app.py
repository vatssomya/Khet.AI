#!/usr/bin/env python3
"""
Khet.ai - AI-Powered Agricultural Platform
Flask Backend Application
"""
import numpy as np
from PIL import Image
import io
import pickle
import tensorflow as tf

plant_model = tf.keras.models.load_model('models/plant_disease_cnn_model.h5')

with open('models/best_model_recommendation.sav', 'rb') as f:
    crop_model = pickle.load(f)

import os
import requests
import google.generativeai as genai
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', '/deleted')
WEATHER_API_KEY = os.environ.get('WEATHER_API_KEY', '/deleted')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '/deleted')

# Configure Gemini AI
#genai.configure(api_key=GEMINI_API_KEY)
#model = genai.GenerativeModel('model used')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/disease-detection')
def disease_detection():
    return render_template('disease-detection.html')

@app.route('/crop-recommendation')
def crop_recommendation():
    return render_template('crop-recommendation.html')

@app.route('/government-schemes')
def government_schemes():
    return render_template('government-schemes.html')

@app.route('/weather-insights')
def weather_insights():
    return render_template('weather-insights.html')

@app.route('/about')
def about():
    return render_template('about.html')

# API Routes
@app.route('/api/weather')
def get_weather():
    """Get weather data for a city"""
    city = request.args.get('city', 'Delhi')
    
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather"
        params = {
            'q': city,
            'appid': WEATHER_API_KEY,
            'units': 'metric'
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        weather_data = {
            'city': data['name'],
            'country': data['sys']['country'],
            'temperature': round(data['main']['temp']),
            'description': data['weather'][0]['description'].title(),
            'humidity': data['main']['humidity'],
            'windSpeed': round(data['wind']['speed'] * 3.6),  # Convert m/s to km/h
            'pressure': data['main']['pressure'],
            'icon': data['weather'][0]['icon']
        }
        
        return jsonify(weather_data)
        
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to fetch weather data'}), 500
    except KeyError as e:
        return jsonify({'error': 'Invalid weather data format'}), 500

@app.route('/api/disease-detect', methods=['POST'])
def detect_disease():
    """Detect plant disease from uploaded image"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        image = request.files['image']
        img = Image.open(image.stream).convert('RGB')
        img = img.resize((224, 224))  # Adjust to match your model input
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        predictions = plant_model.predict(img_array)[0]
        class_index = np.argmax(predictions)
        confidence = float(np.max(predictions))

        # Map index to class name (replace with your actual class list)
        class_names = ['Leaf Blight', 'Powdery Mildew', 'Healthy Plant']
        descriptions = [
            'Bacterial infection affecting leaf tissue.',
            'Fungal disease creating white powdery spots.',
            'No visible signs of infection. Looks healthy.'
        ]
        treatments = [
            'Apply copper-based fungicide and remove affected leaves.',
            'Use neem oil spray and sulfur-based treatments.',
            'Maintain proper watering and pest monitoring.'
        ]

        result = {
            'disease': class_names[class_index],
            'confidence': round(confidence, 2),
            'description': descriptions[class_index],
            'treatment': treatments[class_index]
        }

        return jsonify(result)

    except Exception as e:
        print(f"Error in disease detection: {e}")
        return jsonify({'error': 'Failed to analyze image'}), 500

@app.route('/api/crop-recommend', methods=['POST'])
def recommend_crop():
    """Predict suitable crop based on soil data"""
    try:
        data = request.json
        required_fields = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing input fields'}), 400

        features = np.array([
            float(data['N']),
            float(data['P']),
            float(data['K']),
            float(data['temperature']),
            float(data['humidity']),
            float(data['ph']),
            float(data['rainfall']),
        ]).reshape(1, -1)

        predicted_crop = crop_model.predict(features)[0]
        return jsonify({
            'recommendedCrop': predicted_crop
        })

    except Exception as e:
        print(f"Error in crop recommendation: {e}")
        return jsonify({'error': 'Prediction failed'}), 500

@app.route('/api/chat', methods=['POST'])
def chat_with_ai():
    """AI chatbot powered by Gemini API"""
    try:
        data = request.json or {}
        message = data.get('message', '')
        language = data.get('language', 'en')
        
        if not message.strip():
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        # Create agricultural context prompt
        system_prompt = """You are Khet AI, an expert agricultural assistant for Indian farmers. 
        Provide practical, actionable advice about farming, crops, soil management, pest control, 
        weather considerations, and government schemes. Keep responses concise but informative.
        Focus on sustainable farming practices suitable for Indian agricultural conditions."""
        
        # Language-specific instructions
        if language == 'hi':
            system_prompt += " Respond in Hindi (हिंदी)."
            prompt = f"{system_prompt}\n\nFarmer's question: {message}"
        else:
            prompt = f"{system_prompt}\n\nFarmer's question: {message}"
        
        # Generate response with Gemini
        response = model.generate_content(prompt)
        
        if response.text:
            return jsonify({'response': response.text})
        else:
            return jsonify({'error': 'Could not generate response'}), 500
            
    except Exception as e:
        print(f"Gemini API error: {e}")
        # Fallback response
        fallback_responses = {
            'en': "I'm experiencing technical difficulties. Please try asking your question again, or consult with local agricultural experts for immediate assistance.",
            'hi': "मुझे तकनीकी समस्या हो रही है। कृपया अपना प्रश्न फिर से पूछें, या तत्काल सहायता के लिए स्थानीय कृषि विशेषज्ञों से सलाह लें।"
        }
        user_language = data.get('language', 'en')
        return jsonify({'response': fallback_responses.get(user_language, fallback_responses['en'])})

if __name__ == '__main__':
    # Create templates and static directories if they don't exist
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    os.makedirs('static/images', exist_ok=True)
    
    app.run(host='0.0.0.0', port=5000, debug=True)