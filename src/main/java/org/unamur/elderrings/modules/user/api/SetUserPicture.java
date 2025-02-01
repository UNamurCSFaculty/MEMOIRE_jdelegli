package org.unamur.elderrings.modules.user.api;

import java.util.UUID;

public interface SetUserPicture {

  UUID setPicture(UUID userId, byte[] image);

}