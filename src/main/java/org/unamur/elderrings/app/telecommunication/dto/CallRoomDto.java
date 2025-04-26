package org.unamur.elderrings.app.telecommunication.dto;

import java.util.UUID;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "The call room")
public class CallRoomDto {

  @Schema(description = "The call room unique identifier", required = true, nullable = false)
  private UUID id;
  
}
