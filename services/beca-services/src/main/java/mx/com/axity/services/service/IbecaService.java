package mx.com.axity.services.service;

import mx.com.axity.commons.to.UserTO;
import mx.com.axity.model.ContactDO;

import java.util.List;

public interface IbecaService {

   ContactDO getContact(String name);
}
