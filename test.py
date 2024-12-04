import numpy as np
import cv2
import math as m
import mediapipe as mp
from flask import Flask, Response

device = 0 # on linux might need "/dev/video0"

cap = cv2.VideoCapture(device)
cap.open(device)

if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()
success, image = cap.read()

# Calculate distance
def findDistance(x1, y1, x2, y2):
    dist = m.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    return dist


# Calculate angle.
def findAngle(x1, y1, x2, y2):
    theta = m.acos((y2 - y1) * (-y1) / (m.sqrt(
        (x2 - x1) ** 2 + (y2 - y1) ** 2) * y1))
    degree = int(180 / m.pi) * theta
    return degree

def sendWarning(x):
    pass



print(success)
print(image)


# Display the frame
cv2.imshow("Webcam Feed", image)

