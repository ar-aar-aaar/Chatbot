package mx.com.axity.services.facade.impl;

import mx.com.axity.commons.to.ContactTO;
import mx.com.axity.commons.to.UserTO;
import mx.com.axity.model.ContactDO;
import mx.com.axity.services.facade.IbecaFacade;
import mx.com.axity.services.service.IbecaService;
import mx.com.axity.services.service.impl.becaServiceImpl;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.lang.reflect.Type;
import java.util.List;

@Component
public class becaFacade implements IbecaFacade {

    static final Logger LOG = LogManager.getLogger(becaServiceImpl.class);
    @Autowired
    private IbecaService becaService;

    @Autowired
    ModelMapper modelMapper;

    @Override
    public List<ContactTO> getContactF(String name) {
        List<ContactDO> contact = this.becaService.getContact(name);
        Type contactTOType = new TypeToken<List<ContactTO>>() {}.getType();
        List<ContactTO> contactTO = this.modelMapper.map(contact, contactTOType);
        return contactTO;
    }

    @Override
    public List<ContactTO> getContactBYNameLastname(String name, String lastName) {
        List<ContactDO> contactDO = this.becaService.getContactNA(name, lastName);
        Type contactTOType = new TypeToken<List<ContactTO>>() {}.getType();
        List<ContactTO> contactTO = this.modelMapper.map(contactDO, contactTOType);
        return contactTO;
    }
}
