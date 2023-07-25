package com.practice.chatServer.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer{

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		//for secure webSocket you'll use wss instead ws
		//the wildcard * indicates that the allowed origins can be any domain
		registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();//starter path for all webSocket connections
	}

	@Override
	public void configureMessageBroker(MessageBrokerRegistry registry) {
		registry.setApplicationDestinationPrefixes("/app");
		registry.enableSimpleBroker("/chatroom","/user");//topic prefixes
		registry.setUserDestinationPrefix("/user");//to send message to the a specific user we'll use /user/{username}/private/message
	}

}
