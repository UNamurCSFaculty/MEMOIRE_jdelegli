package org.unamur.elderrings.app.shared.managers;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import jakarta.websocket.Session;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class SocketManager<K> {

  private final Map<K, List<Session>> sessions = new ConcurrentHashMap<>();

  protected boolean hasSession(K key) {
    return sessions.containsKey(key);
  }

  protected void startSession(K key, Session session) {
    if(hasSession(key)){
      sessions.get(key).add(session);
    } else {
      var sessionList = new ArrayList<Session>();
      sessionList.add(session);
      sessions.put(key, sessionList);
    }
  }

  protected void closeSession(K key, Session session) {
    sessions.computeIfPresent(
      key,
      (k, sessionList) -> {
        sessionList.removeIf(s -> s.getId().equals(session.getId()));
        if (sessionList.isEmpty()) {
          return null;
        } else {
          return sessionList;
        }
      }
    );
  }

  protected void send(Session session, Object message) {
    session
      .getAsyncRemote()
      .sendObject(
        message, 
        result-> {
          if(result.getException() != null){
            log.warn("Something went wrong while trying to send message to the socket");
            log.warn(result.getException().getMessage());
          }
        }
      );
  }

  protected void send(Set<K> keys, Object message) {
    sessions
      .entrySet()
      .stream()
      .filter(entry -> keys.contains(entry.getKey()))
      .map(Map.Entry :: getValue)
      .flatMap(List :: stream)
      .filter(Session :: isOpen)
      .forEach(session -> send(session, message));
  }

  protected void send(K key, Object message){
    send(Set.of(key), message);
  }

  protected void broadcast(Object message) {
    sessions
      .values()
      .forEach(sessionVal -> sessionVal.forEach(session -> send(session, message)));
  }

  protected void broadcast(Object message, K exclude) {
    sessions
      .entrySet()
      .stream()
      .filter(entry -> !entry.getKey().equals(exclude))
      .map(Map.Entry :: getValue)
      .flatMap(List :: stream)
      .forEach(session -> send(session, message));
  }

  protected List<K> getSubscribedUsers() {
    return sessions.keySet().stream().sorted().toList();
  }
  
}
