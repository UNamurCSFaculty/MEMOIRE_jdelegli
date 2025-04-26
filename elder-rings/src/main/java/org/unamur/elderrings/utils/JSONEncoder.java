package org.unamur.elderrings.utils;

import java.text.MessageFormat;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import jakarta.websocket.EncodeException;
import jakarta.websocket.Encoder;

public class JSONEncoder implements Encoder.Text<Object> {

  /**
   * Encodes an object to JSON
   * 
   * @param object : the object to encore
   * @return the JSON representation of the object
   * @throws EncodeException
   * 
   */
  @Override
  public String encode(Object object) throws EncodeException {
    try {
      return new ObjectMapper()
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        .registerModule(new JavaTimeModule())
        .writeValueAsString(object);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException(MessageFormat.format("Could not serialize object {0} to JSON", object));

    }
  }
  
  
}
