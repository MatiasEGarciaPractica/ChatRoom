package com.practice.chatServer.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.practice.chatServer.model.Message;

@Controller
public class ChatController {
	
	@Autowired
	private SimpMessagingTemplate simpMessagingTemplate;//we can create dinamic topics with this
	
	//in webSocket we use PayLoad instead body
	@MessageMapping("/message") // /app/message
	@SendTo("/chatroom/public") //now we're using chatroom prefix
	public Message receiveMessage(@Payload Message message) {
		System.out.println("receiveMessage"+ message);
		return message;
	}
	
	@MessageMapping("/private-message")
	public Message recMessage(@Payload Message message) {
		//Like we're using convertAndSendToUser we take the prefix /user that we write in webSocketConfig
		System.out.println("recMessage : " + message);
		simpMessagingTemplate.convertAndSendToUser(message.getReceiverName(),
				"/private",
				message);
		System.out.println(message.toString());
		return message;
	}
	
}
