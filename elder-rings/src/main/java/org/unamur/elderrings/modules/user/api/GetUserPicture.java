package org.unamur.elderrings.modules.user.api;

import java.util.UUID;

public interface GetUserPicture {

  byte[] getPicture(UUID userId);

  byte[] getConnectedUserPicture();

}